const db = require('./index');
const bcrypt = require('bcryptjs');

function seedDatabase(force = false) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0 && !force) {
    console.log('Database already has data. Skipping seed (pass force=true to re-seed).');
    return;
  }

  console.log('🌱 Seeding NovaReserve Database with rich initial data...');

  const transaction = db.transaction(() => {
    // Clear existing tables in correct order if force
    if (force) {
      db.exec(`
        DELETE FROM reviews;
        DELETE FROM bookings;
        DELETE FROM availability_rules;
        DELETE FROM services;
        DELETE FROM categories;
        DELETE FROM users;
      `);
    }

    // 1. Users
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('admin123', salt);
    const userPassHash = bcrypt.hashSync('password123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'Elena Vance',
      'admin@novareserve.com',
      adminPassHash,
      'admin',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    );

    const customerResult = insertUser.run(
      'Marcus Thorne',
      'alex@example.com',
      userPassHash,
      'customer',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
    const defaultCustomerId = customerResult.lastInsertRowid;

    // 2. Categories
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, icon, description, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const wellnessCat = insertCategory.run(
      'Wellness & Recovery',
      'wellness-recovery',
      'Sparkles',
      'Sensory deprivation, infrared therapy, and restorative bodywork.',
      1
    ).lastInsertRowid;

    const studiosCat = insertCategory.run(
      'Creative & Media Studios',
      'creative-studios',
      'Mic',
      'Acoustically tuned podcast suites, video recording, and audio mixing rooms.',
      2
    ).lastInsertRowid;

    const spacesCat = insertCategory.run(
      'Executive & Private Spaces',
      'executive-spaces',
      'Briefcase',
      'High-spec meeting lounges, private boardroom suites, and focus hubs.',
      3
    ).lastInsertRowid;

    const coachingCat = insertCategory.run(
      'Consultation & Advisory',
      'consultation-advisory',
      'Compass',
      'One-on-one strategic sessions with verified industry advisors and founders.',
      4
    ).lastInsertRowid;

    // 3. Services
    const insertService = db.prepare(`
      INSERT INTO services (category_id, title, tag, description, price, duration_min, image_url, capacity, active, highlights)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const s1 = insertService.run(
      wellnessCat,
      'Aura Infrared & Contrast Suite',
      'Bestseller',
      'Private 60-minute session featuring medical-grade full spectrum infrared sauna followed by a mineral cold immersion tub and chromotherapy lighting.',
      85.00,
      60,
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      2,
      1,
      JSON.stringify(['Private Shower & Towels', 'Eucalyptus Aromatherapy', 'Electrolyte Infusion Bar', 'Smart Temperature Controls'])
    ).lastInsertRowid;

    const s2 = insertService.run(
      wellnessCat,
      'Deep Tissue Soundwave Therapy',
      'Signature',
      'Targeted acoustic vibration and neuromuscular bodywork designed to dissolve chronic tension, accelerate post-workout recovery, and enhance lymphatic drainage.',
      140.00,
      75,
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&auto=format&fit=crop&q=80',
      1,
      1,
      JSON.stringify(['Certified Kinetic Therapist', 'Organic Herbal Balms', 'Guided Breathwork Integration'])
    ).lastInsertRowid;

    const s3 = insertService.run(
      studiosCat,
      'Studio A — Dolby Atmos Broadcast Suite',
      'Top Tier',
      'Full multi-camera 4K podcast studio equipped with Shure SM7B microphones, Blackmagic cameras, dynamic LED backdrops, and live engineering support.',
      120.00,
      60,
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      4,
      1,
      JSON.stringify(['4x Shure SM7B Mics', 'Blackmagic 4K Studio Cams', 'Live Multi-Track Stem Recording', 'Customizable RGB Atmosphere'])
    ).lastInsertRowid;

    const s4 = insertService.run(
      studiosCat,
      'Solo Content Creator Pod',
      'Creator Favorite',
      'Acoustic soundproof booth tailored for voiceovers, streaming, remote interviews, and high-fidelity narration with dedicated teleprompter.',
      55.00,
      45,
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      1,
      1,
      JSON.stringify(['Ultra-Quiet Acoustic Dampening', 'Rodecaster Pro II Console', 'iPad Teleprompter Rig'])
    ).lastInsertRowid;

    const s5 = insertService.run(
      spacesCat,
      'The Penthouse Glass Boardroom',
      'Premium',
      'Panoramic skyline views, 85-inch digital whiteboarding display, integrated zoom room conference audio, and catered espresso service.',
      195.00,
      90,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      12,
      1,
      JSON.stringify(['Seats up to 12 Guests', '85" 4K Smart Presentation Screen', 'Artisan Coffee & Refreshments', 'High-speed Wi-Fi 7'])
    ).lastInsertRowid;

    const s6 = insertService.run(
      spacesCat,
      'Private Focus Nook & Dedicated Desk',
      'Popular',
      'Ergonomic Herman Miller setup in a tranquil, silent architectural sanctuary. Includes high-speed dual monitors and unlimited lounge access.',
      40.00,
      120,
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&auto=format&fit=crop&q=80',
      1,
      1,
      JSON.stringify(['Dual 27-inch 4K Displays', 'Herman Miller Aeron Chair', 'Noise Cancelling Headphones available'])
    ).lastInsertRowid;

    const s7 = insertService.run(
      coachingCat,
      'Product Strategy & Architecture Deep Dive',
      'Advisory',
      'High-impact consultation focusing on system scalability, go-to-market mechanics, and tech stack validation with an experienced engineering lead.',
      220.00,
      60,
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      1,
      1,
      JSON.stringify(['Actionable Roadmap Document', 'Recording & Transcription Included', 'Follow-up Email Summary'])
    ).lastInsertRowid;

    const s8 = insertService.run(
      coachingCat,
      'Venture Pitch Deck & Financial Review',
      'Advisory',
      'Comprehensive teardown of your investor deck, unit economics narrative, and founder presentation coaching before fundraising.',
      260.00,
      90,
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
      2,
      1,
      JSON.stringify(['Deck Annotation & Re-writes', 'Cap-table Simulation', 'Investor Q&A Rehearsal'])
    ).lastInsertRowid;

    // 4. Availability rules (Every day 09:00 - 19:00 for all services by default)
    const insertRule = db.prepare(`
      INSERT INTO availability_rules (service_id, day_of_week, start_time, end_time, slot_interval_min)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Standard week schedule for all services (service_id null applies globally)
    for (let day = 0; day <= 6; day++) {
      insertRule.run(null, day, '09:00', '19:00', 60);
    }

    // 5. Initial Realistic Bookings
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nextDay = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        booking_ref, user_id, service_id, booking_date, start_time, end_time,
        customer_name, customer_email, customer_phone, guests_count,
        special_requests, add_ons, total_price, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBooking.run(
      'NR-72941-A',
      defaultCustomerId,
      s1,
      today,
      '10:00',
      '11:00',
      'Marcus Thorne',
      'alex@example.com',
      '+1 (555) 234-8901',
      1,
      'Prefers lavender and rosemary scented towels.',
      JSON.stringify([{ name: 'Organic Cold-Pressed Juice', price: 12 }]),
      97.00,
      'confirmed',
      'paid'
    );

    insertBooking.run(
      'NR-81033-B',
      null,
      s3,
      today,
      '14:00',
      '15:00',
      'Sarah Jenkins',
      'sarah.j@podcraft.fm',
      '+1 (555) 902-4411',
      3,
      'Recording episode #42 of TechPulse. Please prep 3 mics.',
      JSON.stringify([{ name: 'Raw 4K Video Cam ISO Recording', price: 45 }]),
      165.00,
      'confirmed',
      'paid'
    );

    insertBooking.run(
      'NR-64219-C',
      null,
      s5,
      tomorrow,
      '11:00',
      '12:30',
      'David Sterling',
      'dsterling@sterlingcap.io',
      '+1 (555) 301-8899',
      8,
      'Q4 Board Meeting. Ensure AV projector has USB-C adapters.',
      JSON.stringify([{ name: 'Barista Service Package', price: 60 }]),
      255.00,
      'confirmed',
      'pay_at_arrival'
    );

    insertBooking.run(
      'NR-93108-D',
      defaultCustomerId,
      s7,
      nextDay,
      '15:00',
      '16:00',
      'Marcus Thorne',
      'alex@example.com',
      '+1 (555) 234-8901',
      1,
      'Discussing transition from monolithic backend to edge services.',
      '[]',
      220.00,
      'confirmed',
      'paid'
    );

    // 6. Realistic Reviews
    const insertReview = db.prepare(`
      INSERT INTO reviews (service_id, booking_id, author_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReview.run(
      s1,
      1,
      'Marcus T.',
      5,
      'The infrared sauna and cold plunge pairing was unbelievable. Sparkling clean facility and top-notch hospitality.'
    );

    insertReview.run(
      s3,
      2,
      'Sarah J.',
      5,
      'The acoustic isolation in Studio A is world class. Our podcast audio required virtually zero post-processing. Will book weekly.'
    );

    insertReview.run(
      s5,
      null,
      'Harrison Cole',
      5,
      'Client was blown away by the view and seamless hybrid conferencing tech. Worth every dollar.'
    );

    insertReview.run(
      s2,
      null,
      'Maya Lin',
      5,
      'Instant relief for my shoulder impingement. The kinetic soundwave therapy is unlike traditional massage.'
    );

    console.log('✅ Database seeded successfully with demo users, categories, services, bookings, and reviews!');
  });

  transaction();
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
