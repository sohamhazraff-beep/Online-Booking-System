const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('novareserve_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getHeaders(), ...(options.headers || {}) };

  const config = {
    ...options,
    headers,
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    demoLogin: (role = 'admin') =>
      request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    getMe: () => request('/auth/me'),
  },

  categories: {
    getAll: () => request('/categories'),
  },

  services: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/services${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/services/${id}`),
    create: (data) =>
      request('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/services/${id}`, {
        method: 'DELETE',
      }),
  },

  availability: {
    getSlots: (serviceId, date) =>
      request(`/availability?serviceId=${serviceId}&date=${date}`),
  },

  bookings: {
    create: (bookingData) =>
      request('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/bookings${q ? `?${q}` : ''}`);
    },
    lookup: (ref, email) => {
      const q = new URLSearchParams();
      if (ref) q.set('ref', ref);
      if (email) q.set('email', email);
      return request(`/bookings/lookup?${q.toString()}`);
    },
    updateStatus: (id, status, ref = null) => {
      const headers = ref ? { 'x-booking-ref': ref } : {};
      return request(`/bookings/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, booking_ref: ref }),
      });
    },
    reschedule: (id, newDate, newStartTime) =>
      request(`/bookings/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ new_date: newDate, new_start_time: newStartTime }),
      }),
    addReview: (id, reviewData) =>
      request(`/bookings/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
  },

  admin: {
    getStats: () => request('/admin/stats'),
  },
};
