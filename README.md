# NovaReserve — Contemporary Online Booking System

A full-stack, production-grade **Online Booking System** built with **React 18 (Vite)**, **Node.js / Express**, and a **local zero-configuration SQLite database**.

Designed to run immediately out of the box **without** requiring MongoDB, cloud database credentials, or manual `.env` file setup.

---

## ✨ Features at a Glance

### 1. Customer & Public Experience
- **Interactive Multi-Category Catalog**: Browse curated appointments and spaces across **Wellness & Recovery**, **Creative & Media Studios**, **Executive & Private Spaces**, and **Consultation & Advisory**.
- **Real-Time Dynamic Slot Engine**: Computes live slot availability (`09:00 - 19:00`) for any selected date, displays remaining capacity, and prevents double-booking collisions in real time.
- **Frictionless 3-Step Booking Stepper**:
  - **Step 1**: Visual date and time slot selector with live availability badges.
  - **Step 2**: Optional add-on perks (refreshments, raw media recording stems, white-glove setup).
  - **Step 3**: Guest/Customer contact information and payment simulation.
- **Digital QR Ticket Pass**: Instant confirmation pass featuring a scannable QR code, unique 8-character reference code (e.g. `NR-72941-A`), and printable/downloadable PDF-ready layout.
- **Self-Service Customer Portal**: Search any reservation by reference code or email address to reschedule dates, cancel slots, or post verified reviews.

### 2. Admin Command Center
- **Live Operations Dashboard**: Instant KPI cards tracking Gross Revenue, Total Bookings, Today's Scheduled Sessions, and Active Services.
- **Booking Lifecycle Action Center**: Filter bookings by status (`confirmed`, `completed`, `cancelled`), search by customer name/reference, and manage statuses with 1-click controls.
- **Service Catalog Manager**: Create new offerings, update pricing and durations, edit amenity tags, or toggle availability status.

### 3. Zero-Credential Architecture
- **Self-Contained Local Database**: Uses SQLite (`./server/data/novareserve.sqlite`) with WAL mode enabled.
- **Automatic Migration & Seeding**: Auto-creates tables and seeds realistic categories, services, reviews, and bookings on first launch.
- **1-Click Demo Evaluation**: Easily switch between **👑 Admin (Elena)** and **👤 Customer (Marcus)** directly from the header without entering credentials.

---

## 🚀 Quick Start (Runs in Seconds)

### Prerequisites
- Node.js (v18+) & npm

### 1. Install Dependencies
```bash
npm install
```
*(Automatically installs both server and client packages)*

### 2. Start the Application

#### Option A: Unified Production Mode (Recommended)
Builds the client and serves both API and UI on a single port:
```bash
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

#### Option B: Concurrent Development Mode
Runs both the backend API (`http://localhost:5000`) and the Vite frontend with Hot Module Replacement (`http://localhost:5173`):
```bash
npm run dev
```

---

## 🔑 Built-In Demo Accounts

No registration is required to test the system. Use the **1-Click Demo Switcher** in the top navigation bar or log in with:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@novareserve.com` | `admin123` | Full access to Admin Command Center, revenue analytics, booking updates, and service management |
| **Customer** | `alex@example.com` | `password123` | Can book experiences, manage existing reservations, and reschedule slots |
| **Guest** | *(No login required)* | *(None)* | Guests can book directly and look up passes via reference code |

To reset the database back to clean sample data at any time:
```bash
npm run seed
```

---

## 🏗️ Architecture & Project Structure

```
/workspaces/Online-Booking-System/
├── package.json               # Root scripts (install, build, start, dev, seed)
├── start-dev.js               # Concurrent development runner
│
├── server/                    # Node.js & Express REST API
│   ├── index.js               # Server entry point & static SPA server
│   ├── db/
│   │   ├── index.js           # SQLite connection & WAL mode config
│   │   ├── schema.sql         # SQL table definitions
│   │   └── seed.js            # Initial categories, services & demo bookings
│   ├── middleware/
│   │   └── auth.js            # JWT auth & role validation
│   ├── routes/
│   │   ├── auth.js            # Login, register & demo-switch
│   │   ├── categories.js      # Category listings
│   │   ├── services.js        # Service catalog & admin CRUD
│   │   ├── availability.js    # Dynamic real-time slot conflict engine
│   │   ├── bookings.js        # Booking lifecycle, lookup & reschedule
│   │   └── admin.js           # Analytics KPI metrics & revenue stats
│   └── data/
│       └── novareserve.sqlite # Local zero-config SQLite database
│
└── client/                    # React 18 + Vite + Tailwind CSS
    ├── index.html             # HTML entry point with Plus Jakarta Sans typography
    ├── vite.config.js         # Vite configuration with API proxy
    ├── tailwind.config.js     # "Obsidian & Radiant Amber" custom theme
    └── src/
        ├── main.jsx           # React DOM root & AuthProvider
        ├── App.jsx            # Main app shell & view controller
        ├── context/
        │   └── AuthContext.jsx # Auth state & 1-click role switcher
        ├── components/
        │   ├── Navbar.jsx              # Navigation & role selector
        │   ├── HeroBanner.jsx          # Editorial hero & search bar
        │   ├── CategoryFilter.jsx      # Dynamic category pill tabs
        │   ├── ServiceCard.jsx         # Experience card with specs & CTA
        │   ├── ServiceDetailModal.jsx  # Full breakdown & reviews modal
        │   ├── BookingModal.jsx        # 3-step interactive booking flow
        │   ├── BookingPassModal.jsx    # QR code ticket & printable pass
        │   ├── MyBookingsView.jsx      # Self-service lookup & reschedule
        │   ├── AdminDashboard.jsx      # Metrics, booking table & service manager
        │   └── AuthModal.jsx           # Sign in / Sign up modal
        └── utils/
            └── api.js                  # Centralized API fetch layer
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health and SQLite status check | No |
| `POST` | `/api/auth/demo-login` | 1-click instant login as Admin or Customer | No |
| `POST` | `/api/auth/login` | Email/password login | No |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `GET` | `/api/categories` | Retrieve all categories with service counts | No |
| `GET` | `/api/services` | Retrieve active services with ratings & filters | No |
| `GET` | `/api/services/:id` | Retrieve service details and verified reviews | No |
| `GET` | `/api/availability` | Calculate real-time available time slots for a date | No |
| `POST` | `/api/bookings` | Create reservation with slot collision prevention | No |
| `GET` | `/api/bookings/lookup` | Look up reservations by reference code or email | No |
| `PATCH`| `/api/bookings/:id/status`| Update booking status (confirmed/completed/cancelled)| Yes |
| `POST` | `/api/bookings/:id/reschedule`| Reschedule reservation to a new date and time slot | Yes |
| `GET` | `/api/admin/stats` | Analytics KPI totals, revenue, and trends | Admin Only |
| `POST` | `/api/services` | Create new service offering | Admin Only |
| `PUT` | `/api/services/:id` | Update service pricing, duration, or details | Admin Only |

---

## 🎨 UI/UX Design System

- **Palette**: Obsidian Slate (`#070a0f`, `#0c1017`) accented with **Radiant Amber** (`#f59e0b`) and **Electric Indigo** (`#6366f1`).
- **Interactive Feedback**: Celebratory confetti upon booking confirmation, animated badge indicators, and dynamic QR code generation.
- **Responsive**: Fully optimized for mobile screens, tablets, and widescreen desktop dashboards.
