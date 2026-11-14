import db, { initDb } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seedDb() {
  initDb();

  // Check if users already seeded
  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (existingUser) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding MediSwift database...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Users
  const userAbhiramId = 'usr-abhiram-001';
  const adminId = 'usr-admin-001';

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userAbhiramId,
    'Abhiram Reddy',
    'user@mediswift.com',
    passwordHash,
    'user',
    '+91 98765 43210',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  );

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'Dr. Rajesh Sharma (Pharmacist)',
    'admin@mediswift.com',
    adminPasswordHash,
    'admin',
    '+91 91234 56789',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80'
  );

  // 2. User Addresses
  const addressId1 = 'addr-001';
  const addressId2 = 'addr-002';
  db.prepare(`
    INSERT INTO addresses (id, user_id, label, full_name, phone, house_no, street, area, city, state, pincode, lat, lng, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(addressId1, userAbhiramId, 'Home', 'Abhiram Reddy', '+91 98765 43210', '#42, 3rd Cross', 'Koramangala 4th Block', 'Koramangala', 'Bengaluru', 'Karnataka', '560034', 12.9352, 77.6245, 1);

  db.prepare(`
    INSERT INTO addresses (id, user_id, label, full_name, phone, house_no, street, area, city, state, pincode, lat, lng, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(addressId2, userAbhiramId, 'Office', 'Abhiram Reddy', '+91 98765 43210', 'Tech Park Tower B, 5th Floor', 'Outer Ring Road', 'Bellandur', 'Bengaluru', 'Karnataka', '560103', 12.9279, 77.6806, 0);

  // 3. Categories
  const categories = [
    { id: 'cat-01', name: 'Pain Relief', slug: 'pain-relief', icon: 'ShieldAlert', description: 'Fast acting pain killers and anti-inflammatories' },
    { id: 'cat-02', name: 'Fever & Cold', slug: 'fever-cold', icon: 'Thermometer', description: 'Antipyretics, decongestants and cold syrups' },
    { id: 'cat-03', name: 'Vitamins & Supplements', slug: 'vitamins', icon: 'Pill', description: 'Daily multivitamins, minerals and immunity boosters' },
    { id: 'cat-04', name: 'Diabetes Care', slug: 'diabetes', icon: 'Activity', description: 'Insulin, test strips, blood glucose monitors and care' },
    { id: 'cat-05', name: 'Digestive Health', slug: 'digestive', icon: 'Zap', description: 'Antacids, laxatives, probiotics and gut enzymes' },
    { id: 'cat-06', name: 'Skin Care', slug: 'skincare', icon: 'Sparkles', description: 'Dermatological creams, ointments and acne care' },
    { id: 'cat-07', name: 'Personal Care', slug: 'personal-care', icon: 'Heart', description: 'Hygiene products, soaps, sanitizers and oral care' },
    { id: 'cat-08', name: 'Baby Care', slug: 'baby-care', icon: 'Smile', description: 'Baby food, diapers, wipes and gentle lotion' },
    { id: 'cat-09', name: 'First Aid', slug: 'first-aid', icon: 'Cross', description: 'Bandages, antiseptics, cotton rolls and tapes' },
    { id: 'cat-10', name: 'Women\'s Health', slug: 'womens-health', icon: 'UserCheck', description: 'Feminine hygiene, iron supplements and wellness' },
    { id: 'cat-11', name: 'Men\'s Health', slug: 'mens-health', icon: 'User', description: 'Men\'s multivitamins, hair loss care and stamina' },
    { id: 'cat-12', name: 'Medical Devices', slug: 'medical-devices', icon: 'Stethoscope', description: 'BP monitors, pulse oximeters, nebulizers' }
  ];

  const insertCat = db.prepare('INSERT INTO categories (id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)');
  for (const c of categories) {
    insertCat.run(c.id, c.name, c.slug, c.icon, c.description);
  }

  // 4. Pharmacies
  const pharmacies = [
    {
      id: 'ph-01',
      name: 'Apollo Pharmacy — Koramangala',
      logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=150&q=80',
      rating: 4.8,
      address: '77, 80 Feet Road, Koramangala 4th Block',
      city: 'Bengaluru',
      area: 'Koramangala',
      pincode: '560034',
      lat: 12.9340,
      lng: 77.6220,
      phone: '+91 80 2553 1122',
      is_open: 1,
      estimated_delivery_min: 20
    },
    {
      id: 'ph-02',
      name: 'MedPlus Pharmacy — Indiranagar',
      logo: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=150&q=80',
      rating: 4.6,
      address: '412, 100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      area: 'Indiranagar',
      pincode: '560038',
      lat: 12.9698,
      lng: 77.6415,
      phone: '+91 80 2525 9900',
      is_open: 1,
      estimated_delivery_min: 25
    },
    {
      id: 'ph-03',
      name: 'Netmeds Store — HSR Layout',
      logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=150&q=80',
      rating: 4.7,
      address: 'Shop 14, 27th Main Rd, Sector 1, HSR Layout',
      city: 'Bengaluru',
      area: 'HSR Layout',
      pincode: '560102',
      lat: 12.9116,
      lng: 77.6389,
      phone: '+91 80 4112 3344',
      is_open: 1,
      estimated_delivery_min: 30
    },
    {
      id: 'ph-04',
      name: 'Wellness Forever — BTM Layout',
      logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=150&q=80',
      rating: 4.5,
      address: 'Outer Ring Rd, 2nd Stage, BTM Layout',
      city: 'Bengaluru',
      area: 'BTM Layout',
      pincode: '560076',
      lat: 12.9166,
      lng: 77.6101,
      phone: '+91 80 2668 5566',
      is_open: 1,
      estimated_delivery_min: 22
    },
    {
      id: 'ph-05',
      name: 'Frank Ross Pharmacy — Jayanagar',
      logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
      address: '320, 11th Main Road, 4th T Block, Jayanagar',
      city: 'Bengaluru',
      area: 'Jayanagar',
      pincode: '560041',
      lat: 12.9250,
      lng: 77.5938,
      phone: '+91 80 2654 7788',
      is_open: 1,
      estimated_delivery_min: 35
    }
  ];

  const insertPh = db.prepare(`
    INSERT INTO pharmacies (id, name, logo, rating, address, city, area, pincode, lat, lng, phone, is_open, estimated_delivery_min)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of pharmacies) {
    insertPh.run(p.id, p.name, p.logo, p.rating, p.address, p.city, p.area, p.pincode, p.lat, p.lng, p.phone, p.is_open, p.estimated_delivery_min);
  }

  // 5. Medicines (20 items)
  const medicines = [
    {
      id: 'med-01',
      name: 'Dolo 650 Tablet',
      generic_name: 'Paracetamol 650mg',
      brand: 'Micro Labs',
      category_id: 'cat-02',
      strength: '650mg',
      manufacturer: 'Micro Labs Ltd',
      price: 30.50,
      discount: 10,
      availability: 1,
      prescription_required: 0,
      description: 'Dolo 650 Tablet is an antipyretic medicine used to relieve fever and mild to moderate pain including headache, body ache, and toothache.',
      uses: 'Fever reduction, headache relief, muscle soreness, post-vaccination fever',
      warnings: 'Do not exceed 4g paracetamol per day. Avoid alcohol while taking this medication.',
      storage_info: 'Store below 30°C in a dry place away from direct sunlight.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-02',
      name: 'Crocin 500mg Advance',
      generic_name: 'Paracetamol 500mg',
      brand: 'GSK Consumer Healthcare',
      category_id: 'cat-02',
      strength: '500mg',
      manufacturer: 'GlaxoSmithKline',
      price: 24.00,
      discount: 5,
      availability: 1,
      prescription_required: 0,
      description: 'Crocin Advance features Optizorb technology which gets to work 5 times faster than standard paracetamol tablets.',
      uses: 'Fast fever relief, joint pain, dental pain, backache',
      warnings: 'Consult doctor if fever persists for more than 3 days.',
      storage_info: 'Keep out of reach of children. Store in original pack.',
      image: 'https://images.unsplash.com/photo-1550572017-edf792890003?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-03',
      name: 'Combiflam Tablet',
      generic_name: 'Ibuprofen (400mg) + Paracetamol (325mg)',
      brand: 'Sanofi India',
      category_id: 'cat-01',
      strength: '400mg / 325mg',
      manufacturer: 'Sanofi India Ltd',
      price: 42.00,
      discount: 12,
      availability: 1,
      prescription_required: 0,
      description: 'Combiflam combines NSAID ibuprofen with paracetamol for powerful anti-inflammatory and dual action pain relief.',
      uses: 'Severe headache, arthritis pain, dental surgery pain, period pain',
      warnings: 'Take with food or milk to prevent stomach upset. Not recommended in kidney diseases.',
      storage_info: 'Store in a cool dry place.',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-04',
      name: 'Becosules Z Capsules',
      generic_name: 'B-Complex + Vitamin C + Zinc',
      brand: 'Pfizer',
      category_id: 'cat-03',
      strength: 'Multi-dose',
      manufacturer: 'Pfizer Ltd',
      price: 52.00,
      discount: 15,
      availability: 1,
      prescription_required: 0,
      description: 'Essential B-complex vitamins enriched with Vitamin C and elemental Zinc to boost immunity, tissue repair and cellular energy.',
      uses: 'Mouth ulcers, general weakness, recovery after illness, hair and skin nutritional support',
      warnings: 'May cause harmless harmless yellow discoloration of urine due to Vitamin B2.',
      storage_info: 'Store in cool place protected from light.',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-05',
      name: 'Amoxyclav 625mg Tablet',
      generic_name: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      brand: 'Cipla',
      category_id: 'cat-01',
      strength: '625mg',
      manufacturer: 'Cipla Ltd',
      price: 215.00,
      discount: 8,
      availability: 1,
      prescription_required: 1,
      description: 'Broad spectrum penicillin-type antibiotic used to treat bacterial infections of lungs, ears, sinuses, urinary tract and skin.',
      uses: 'Bacterial sinusitis, bronchitis, pneumonia, UTI, wound infection',
      warnings: 'PRESCRIPTION REQUIRED. Complete full course as prescribed even if symptoms improve.',
      storage_info: 'Store away from heat and moisture.',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-06',
      name: 'Glycomet 500mg SR',
      generic_name: 'Metformin Hydrochloride 500mg',
      brand: 'USV Ltd',
      category_id: 'cat-04',
      strength: '500mg SR',
      manufacturer: 'USV Private Limited',
      price: 35.00,
      discount: 5,
      availability: 1,
      prescription_required: 1,
      description: 'Sustained release oral antihyperglycemic drug for managing Type 2 Diabetes Mellitus.',
      uses: 'Blood sugar level maintenance, Type 2 diabetes control',
      warnings: 'PRESCRIPTION REQUIRED. Take with evening meal. Monitor kidney function regularly.',
      storage_info: 'Store below 25°C.',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-07',
      name: 'Pan-40 Tablet',
      generic_name: 'Pantoprazole 40mg',
      brand: 'Alkem Laboratories',
      category_id: 'cat-05',
      strength: '40mg',
      manufacturer: 'Alkem Labs',
      price: 110.00,
      discount: 10,
      availability: 1,
      prescription_required: 0,
      description: 'Proton pump inhibitor (PPI) that reduces acid production in the stomach, curing heart burn and acid reflux.',
      uses: 'GERD, acid reflux, stomach ulcer prevention, acidity',
      warnings: 'Swallow whole with water 30 minutes before breakfast.',
      storage_info: 'Protect from moisture.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-08',
      name: 'Eno Fruit Salt (Lemon Flavour)',
      generic_name: 'Sodic Bicarbonate + Citric Acid',
      brand: 'GSK',
      category_id: 'cat-05',
      strength: '5g sachet',
      manufacturer: 'GlaxoSmithKline',
      price: 10.00,
      discount: 0,
      availability: 1,
      prescription_required: 0,
      description: 'Fast acting antacid powder that neutralizes stomach acid in 6 seconds to provide relief from gas and indigestion.',
      uses: 'Acidity, heartburn, gas bloating, heavy stomach after meals',
      warnings: 'Do not take more than 2 sachets in 24 hours.',
      storage_info: 'Store sachet in dry container.',
      image: 'https://images.unsplash.com/photo-1550572017-edf792890003?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-09',
      name: 'Limcee 500mg Chewable',
      generic_name: 'Vitamin C (Ascorbic Acid) 500mg',
      brand: 'Abbott',
      category_id: 'cat-03',
      strength: '500mg',
      manufacturer: 'Abbott Healthcare',
      price: 25.00,
      discount: 10,
      availability: 1,
      prescription_required: 0,
      description: 'Tangy orange chewable tablets supplying daily requirement of Vitamin C to bolster immunity and collagen growth.',
      uses: 'Immunity improvement, cold prevention, antioxidant support',
      warnings: 'Chew tablet before swallowing. Do not overdose.',
      storage_info: 'Store in cool place.',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-10',
      name: 'Betadine 10% Ointment 15g',
      generic_name: 'Povidone-Iodine 10%',
      brand: 'Win-Medicare',
      category_id: 'cat-09',
      strength: '10% w/w',
      manufacturer: 'Win Medicare',
      price: 115.00,
      discount: 8,
      availability: 1,
      prescription_required: 0,
      description: 'Topical antiseptic ointment for treatment and prevention of infection in minor cuts, scrapes, burns and abrasions.',
      uses: 'Wound cleaning, burn disinfection, surgical dressing support',
      warnings: 'For external use only. Discontinue if rash occurs.',
      storage_info: 'Store below 25°C.',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-11',
      name: 'DermaViva Aloe Vera Gel 100g',
      generic_name: 'Pure Aloe Vera Extract 99%',
      brand: 'Dabur',
      category_id: 'cat-06',
      strength: '100g',
      manufacturer: 'Dabur India',
      price: 180.00,
      discount: 20,
      availability: 1,
      prescription_required: 0,
      description: 'Organic aloe vera gel providing intense hydration, soothing sunburns, calming irritated skin and reducing redness.',
      uses: 'Skin hydration, acne soothing, hair styling, post-shave balm',
      warnings: 'Patch test recommended before full application.',
      storage_info: 'Keep in refrigerator for extra cooling effect.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-12',
      name: 'Accu-Chek Active Test Strips 50s',
      generic_name: 'Glucose Oxidase Test Strips',
      brand: 'Roche Diabetes Care',
      category_id: 'cat-04',
      strength: '50 Strips pack',
      manufacturer: 'Roche Diagnostics',
      price: 975.00,
      discount: 15,
      availability: 1,
      prescription_required: 0,
      description: 'Precision blood glucose testing strips for Accu-Chek Active glucometer with fast 5-second result output.',
      uses: 'Self-monitoring of blood glucose levels at home',
      warnings: 'Use within 3 months of opening container.',
      storage_info: 'Close container lid tightly immediately after removing strip.',
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-13',
      name: 'Omron M2 Basic Automatic BP Monitor',
      generic_name: 'Digital Oscillometric Blood Pressure Monitor',
      brand: 'Omron',
      category_id: 'cat-12',
      strength: 'Single Unit',
      manufacturer: 'Omron Healthcare',
      price: 2490.00,
      discount: 18,
      availability: 1,
      prescription_required: 0,
      description: 'Fully automatic digital blood pressure monitor with Intellisense technology for accurate and painless inflation.',
      uses: 'Systolic/diastolic blood pressure and pulse rate tracking',
      warnings: 'Rest for 5 minutes before taking reading.',
      storage_info: 'Store in protective padded case.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-14',
      name: 'Pampers Premium Care Diapers (M)',
      generic_name: 'Soft Absorbent Baby Diaper Pant',
      brand: 'Procter & Gamble',
      category_id: 'cat-08',
      strength: '34 Pants pack',
      manufacturer: 'P&G Hygiene',
      price: 799.00,
      discount: 22,
      availability: 1,
      prescription_required: 0,
      description: 'Cottonlike softness with 3 3D absorbing channels to keep baby dry up to 12 hours with wetness indicator.',
      uses: 'Infant overnight dryness and rash prevention',
      warnings: 'Change diaper immediately when wetness indicator turns blue.',
      storage_info: 'Store in clean dry cabinet.',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-15',
      name: 'Sebamed Baby Gentle Wash 200ml',
      generic_name: 'Sugar-based Cleanser pH 5.5',
      brand: 'Sebamed',
      category_id: 'cat-08',
      strength: '200ml',
      manufacturer: 'Sebapharma GmbH',
      price: 640.00,
      discount: 10,
      availability: 1,
      prescription_required: 0,
      description: '100% soap-free and alkali-free cleanser with ideal pH 5.5 to support baby skin natural protective acid mantle.',
      uses: 'Daily bath care for newborn delicate sensitive skin',
      warnings: 'Rinse thoroughly with lukewarm water.',
      storage_info: 'Store below 25°C.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-16',
      name: 'Evion 400mg Vitamin E Capsule',
      generic_name: 'Tocopheryl Acetate 400mg',
      brand: 'Merck India',
      category_id: 'cat-03',
      strength: '400mg',
      manufacturer: 'Procter & Gamble Health',
      price: 38.00,
      discount: 5,
      availability: 1,
      prescription_required: 0,
      description: 'Lipid-soluble antioxidant vitamin E nourishing cellular membranes, improving skin glow and muscle healing.',
      uses: 'Skin moisture, anti-aging nourishment, leg cramp prevention',
      warnings: 'Consult physician if taking anticoagulant medications.',
      storage_info: 'Keep bottle tightly closed in dark room.',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-17',
      name: 'Revital H Capsule for Men',
      generic_name: 'Ginseng Extract + 9 Minerals + 12 Vitamins',
      brand: 'Sun Pharma',
      category_id: 'cat-11',
      strength: '30 Capsules pack',
      manufacturer: 'Sun Pharmaceutical',
      price: 330.00,
      discount: 12,
      availability: 1,
      prescription_required: 0,
      description: 'Daily health supplement with Natural Ginseng to stay active, energetic and overcome daily physical stress.',
      uses: 'Mental stamina, physical endurance, daily energy retention',
      warnings: 'Take 1 capsule daily after breakfast with water.',
      storage_info: 'Store in cool dry place.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-18',
      name: 'Dexorange Syrup 200ml',
      generic_name: 'Ferric Ammonium Citrate + Folic Acid + Cyanocobalamin',
      brand: 'Franco-Indian',
      category_id: 'cat-10',
      strength: '200ml',
      manufacturer: 'Franco-Indian Pharmaceuticals',
      price: 172.00,
      discount: 10,
      availability: 1,
      prescription_required: 0,
      description: 'Delicious iron syrup helping build hemoglobin, red blood cells and treat anemia in women, teenagers and elderly.',
      uses: 'Iron deficiency anemia, pregnancy nutritional support, fatigue',
      warnings: 'May cause dark stools which is normal with oral iron.',
      storage_info: 'Shake well before use.',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-19',
      name: 'Volini Pain Relief Spray 100g',
      generic_name: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol',
      brand: 'Sun Pharma',
      category_id: 'cat-01',
      strength: '100g spray bottle',
      manufacturer: 'Sun Pharma Ltd',
      price: 325.00,
      discount: 15,
      availability: 1,
      prescription_required: 0,
      description: 'Quick action pain relief aerosol spray providing deep micro-penetration for instant joint and back pain relief.',
      uses: 'Sprains, neck pain, lower back pain, sports injuries',
      warnings: 'Flammable. Do not spray near open flame or eyes.',
      storage_info: 'Keep away from direct heat (>50°C).',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'med-20',
      name: 'Otrivin Adult Nasal Spray 10ml',
      generic_name: 'Xylometazoline Hydrochloride 0.1%',
      brand: 'GSK Consumer',
      category_id: 'cat-02',
      strength: '0.1% w/v',
      manufacturer: 'GlaxoSmithKline',
      price: 110.00,
      discount: 5,
      availability: 1,
      prescription_required: 0,
      description: 'Fast acting decongestant opening blocked nose within 2 minutes and keeping nasal passages clear for up to 12 hours.',
      uses: 'Nasal congestion due to cold, hay fever, sinusitis',
      warnings: 'Do not use continuously for more than 7 consecutive days.',
      storage_info: 'Keep nozzle cap closed after use.',
      image: 'https://images.unsplash.com/photo-1550572017-edf792890003?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const insertMed = db.prepare(`
    INSERT INTO medicines (id, name, generic_name, brand, category_id, strength, manufacturer, price, discount, availability, prescription_required, description, uses, warnings, storage_info, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of medicines) {
    insertMed.run(m.id, m.name, m.generic_name, m.brand, m.category_id, m.strength, m.manufacturer, m.price, m.discount, m.availability, m.prescription_required, m.description, m.uses, m.warnings, m.storage_info, m.image);
  }

  // 6. Pharmacy Medicine Stock Mapping
  const insertPm = db.prepare(`
    INSERT INTO pharmacy_medicines (id, pharmacy_id, medicine_id, stock, price_override)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const p of pharmacies) {
    for (const m of medicines) {
      const stock = Math.floor(Math.random() * 80) + 15;
      insertPm.run(uuidv4(), p.id, m.id, stock, null);
    }
  }

  // 7. Sample Prescriptions
  const prescId1 = 'presc-101';
  db.prepare(`
    INSERT INTO prescriptions (id, user_id, order_id, file_path, file_name, file_type, notes, status, pharmacist_notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    prescId1,
    userAbhiramId,
    null,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    'Dr_Rao_Prescription_Aug2026.jpg',
    'image/jpeg',
    'Please send 1 strip of Amoxyclav 625mg and Glycomet 500mg as prescribed by Dr. Rao.',
    'Verified',
    'Prescription verified by Pharmacist Dr. Rajesh. Doctor reg #33921 valid.',
    '2026-08-20 10:30:00'
  );

  // 8. Sample Orders & Order Items & Delivery Tracking
  const orderId1 = 'ord-1001';
  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, pharmacy_id, address_id, total_amount, subtotal, delivery_fee, discount_amount, payment_method, payment_status, order_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId1,
    'ORD-20260821-00125',
    userAbhiramId,
    'ph-01',
    addressId1,
    275.40,
    266.00,
    29.00,
    19.60,
    'UPI',
    'Paid',
    'Out for Delivery',
    '2026-08-22 14:15:00'
  );

  db.prepare(`
    INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price, prescription_required)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orderId1, 'med-01', 2, 27.45, 0);

  db.prepare(`
    INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price, prescription_required)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orderId1, 'med-05', 1, 197.80, 1);

  // Delivery tracking steps for Order 1
  const steps = [
    { step: 'Order Placed', status: 'completed', driver_name: 'Ramesh Kumar', driver_phone: '+91 99887 76655', lat: 12.9340, lng: 77.6220 },
    { step: 'Pharmacy Confirmed', status: 'completed', driver_name: 'Ramesh Kumar', driver_phone: '+91 99887 76655', lat: 12.9340, lng: 77.6220 },
    { step: 'Medicine Packed', status: 'completed', driver_name: 'Ramesh Kumar', driver_phone: '+91 99887 76655', lat: 12.9342, lng: 77.6225 },
    { step: 'Out for Delivery', status: 'active', driver_name: 'Ramesh Kumar', driver_phone: '+91 99887 76655', lat: 12.9348, lng: 77.6235 },
    { step: 'Delivered', status: 'pending', driver_name: 'Ramesh Kumar', driver_phone: '+91 99887 76655', lat: 12.9352, lng: 77.6245 }
  ];

  const insertTrack = db.prepare(`
    INSERT INTO delivery_tracking (id, order_id, step, status, driver_name, driver_phone, driver_lat, driver_lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of steps) {
    insertTrack.run(uuidv4(), orderId1, s.step, s.status, s.driver_name, s.driver_phone, s.lat, s.lng);
  }

  // 9. Sample Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, is_read, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(uuidv4(), userAbhiramId, 'Order Confirmed! 🎉', 'Your order #ORD-20260821-00125 has been confirmed by Apollo Pharmacy Koramangala.', 0, 'order', '2026-08-22 14:16:00');
  insertNotif.run(uuidv4(), userAbhiramId, 'Out for Delivery 🚚', 'Ramesh Kumar is on the way to deliver your medicines in ~15 mins.', 0, 'delivery', '2026-08-22 14:30:00');
  insertNotif.run(uuidv4(), userAbhiramId, 'Prescription Approved ✅', 'Your uploaded doctor prescription has been verified by Pharmacist Dr. Rajesh.', 1, 'prescription', '2026-08-20 10:31:00');

  console.log('Database seeded successfully with demo data!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDb();
}
