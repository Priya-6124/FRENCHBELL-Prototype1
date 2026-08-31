import getDb from './db.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Starting French Bell Cafe Database Seeding...');
  const db = await getDb();

  // Clear tables
  await db.exec(`
    DELETE FROM receipts;
    DELETE FROM payments;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM notifications;
    DELETE FROM advertisements;
    DELETE FROM offers;
    DELETE FROM menu_items;
    DELETE FROM menu_categories;
    DELETE FROM users;
    DELETE FROM settings;
  `);

  // 1. Settings
  const settings = [
    ['cafe_name', 'French Bell Cafe'],
    ['cafe_address', 'K. Narayanpura, Bengaluru – 560077, Karnataka'],
    ['cafe_phone', '+91 98765 43210'],
    ['cafe_email', 'hello@frenchbellcafe.com'],
    ['free_delivery_km', '2'],
    ['delivery_fee_per_km', '15'],
    ['min_order_delivery', '120'],
    ['dine_in_enabled', '1'],
    ['takeaway_enabled', '1'],
    ['delivery_enabled', '1'],
    ['whatsapp_enabled', '1']
  ];
  for (const [key, value] of settings) {
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  // 2. Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await db.run(`
    INSERT INTO users (name, phone, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `, ['French Bell Admin', '9876543210', 'admin@frenchbell.com', adminPassword, 'admin']);

  await db.run(`
    INSERT INTO users (name, phone, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `, ['Rohan Sharma', '9123456789', 'rohan@example.com', customerPassword, 'customer']);

  // 3. Menu Categories
  const categories = [
    { id: 1, name: 'Starters', slug: 'starters', display_order: 1 },
    { id: 2, name: 'Strips', slug: 'strips', display_order: 2 },
    { id: 3, name: 'Momos', slug: 'momos', display_order: 3 },
    { id: 4, name: 'Burgers', slug: 'burgers', display_order: 4 },
    { id: 5, name: 'Sandwich', slug: 'sandwich', display_order: 5 },
    { id: 6, name: 'Rolls', slug: 'rolls', display_order: 6 },
    { id: 7, name: 'Loaded', slug: 'loaded', display_order: 7 },
    { id: 8, name: 'Platters', slug: 'platters', display_order: 8 }
  ];

  for (const cat of categories) {
    await db.run(`
      INSERT INTO menu_categories (id, name, slug, display_order, active)
      VALUES (?, ?, ?, ?, 1)
    `, [cat.id, cat.name, cat.slug, cat.display_order]);
  }

  // 4. Menu Items
  const menuItems = [
    // Starters
    { category_id: 1, name: 'Classic Fries', description: 'Crispy golden French fries tossed with sea salt & served with house dip.', veg_type: 'veg', price: 60, popular: 1, image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80' },
    { category_id: 1, name: 'Peri Peri Fries', description: 'Crispy fries liberally dusted with signature spicy French Bell peri peri seasoning.', veg_type: 'veg', price: 70, popular: 1, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 1, name: 'Cheesy Fries', description: 'Golden fries smothered in warm molten cheddar cheese sauce and garlic herbs.', veg_type: 'veg', price: 80, popular: 0, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 1, name: 'Nuggets', description: 'Bite-sized crunchy chicken nuggets seasoned to perfection with tangy mayo.', veg_type: 'non-veg', price: 70, popular: 0, image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80' },

    // Strips
    { category_id: 2, name: 'Crispy Classic Strips', description: 'Tender chicken breast strips battered and fried till super crispy.', veg_type: 'non-veg', price: 129, popular: 1, image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },
    { category_id: 2, name: 'Peri Peri Strips', description: 'Crispy strips glazed in fiery African bird-eye chilli peri peri spice mix.', veg_type: 'non-veg', price: 130, popular: 0, image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },
    { category_id: 2, name: 'Thai Honey Strips', description: 'Golden chicken strips tossed in sweet Thai honey chili glaze & toasted sesame.', veg_type: 'non-veg', price: 149, popular: 1, image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },
    { category_id: 2, name: 'Dynamite Strips', description: 'Extra spicy chicken strips coated in dynamite aioli sauce.', veg_type: 'non-veg', price: 149, popular: 1, image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },

    // Momos (dual Chicken & Veg pricing)
    { category_id: 3, name: 'Fried Momos', description: 'Crispy fried dumplings packed with savory filling & spicy red chutney.', veg_type: 'non-veg', price: 80, price_chicken: 80, price_veg: 70, popular: 1, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'Peri Peri Momos', description: 'Deep fried momos tossed in spicy peri peri dry rub and mint dip.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'Dynamite Momos', description: 'Momos drenched in explosive dynamite garlic cream sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'Kanthari Momos', description: 'Spicy Kerala bird-eye kanthari chilli infused momos with cream sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'BBQ Momos', description: 'Smoky hickory barbecue tossed momos garnished with spring onions.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'Honey Chilli Momos', description: 'Crispy momos coated in sticky honey chilli garlic sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },
    { category_id: 3, name: 'Schezwan Momos', description: 'Wok tossed momos in extra fiery Schezwan chilli garlic relish.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' },

    // Burgers
    { category_id: 4, name: 'Veg Burger', description: 'Crispy vegetable patty with fresh lettuce, tomato, cheese and signature mayo.', veg_type: 'veg', price: 79, popular: 0, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80' },
    { category_id: 4, name: 'Chicken Burger', description: 'Juicy seasoned chicken patty topped with caramelized onions and house relish.', veg_type: 'non-veg', price: 89, popular: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
    { category_id: 4, name: 'Zinger Burger', description: 'Extra crunchy fried chicken fillet layered with crunchy lettuce & spicy zinger sauce.', veg_type: 'non-veg', price: 99, popular: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
    { category_id: 4, name: 'Double Chicken Burger', description: 'Double juicy chicken patties stacked with double melted cheese slices.', veg_type: 'non-veg', price: 139, popular: 0, image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80' },
    { category_id: 4, name: 'Double Zinger Burger', description: 'Two mammoth crunchy zinger fillets packed inside soft toasted brioche.', veg_type: 'non-veg', price: 159, popular: 1, image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80' },
    { category_id: 4, name: 'Cheesy Alfredo Burger', description: 'Gourmet chicken burger dripping in velvety white Alfredo cheese sauce.', veg_type: 'non-veg', price: 179, popular: 1, image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80' },

    // Sandwich
    { category_id: 5, name: 'Veg Sandwich', description: 'Freshly toasted bread stuffed with crunchy garden vegetables & herb mayo.', veg_type: 'veg', price: 69, popular: 0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Veg Club Sandwich', description: 'Triple decker toasted sandwich packed with paneer, veggies, cheese & spread.', veg_type: 'veg', price: 89, popular: 0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Chicken Sandwich', description: 'Shredded roasted chicken tossed in creamy pepper mayonnaise.', veg_type: 'non-veg', price: 99, popular: 0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Chicken Club Sandwich', description: 'Triple tier classic club with chicken, egg, lettuce, tomato & melted cheddar.', veg_type: 'non-veg', price: 119, popular: 1, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Crispy Chicken Sandwich', description: 'Golden crispy chicken tender on grilled buttered bread with spicy dip.', veg_type: 'non-veg', price: 129, popular: 0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Crispy Chicken Club Sandwich', description: 'Loaded triple club featuring crispy chicken strips, cheese and smoked relish.', veg_type: 'non-veg', price: 149, popular: 0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { category_id: 5, name: 'Nachos Crispy Club Sandwich', description: 'Ultimate club loaded with crunchy nachos, crispy chicken & melted cheese lava.', veg_type: 'non-veg', price: 169, popular: 1, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },

    // Rolls
    { category_id: 6, name: 'Veg Roll', description: 'Flaky paratha loaded with spiced veggies, onions and tangy mint chutney.', veg_type: 'veg', price: 89, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Paneer Roll', description: 'Char-grilled cottage cheese cubes wrapped in layered flaky bread with spices.', veg_type: 'veg', price: 90, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Mexican Roll', description: 'Zesty Mexican seasoned paneer/veggies with salsa & melted jalapeño cheese.', veg_type: 'veg', price: 109, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Crispy Chicken Roll', description: 'Crunchy chicken tenders rolled with pickled onions & garlic cream sauce.', veg_type: 'non-veg', price: 109, popular: 1, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'FB Chicken Roll', description: 'French Bell signature spiced roasted chicken roll with secret herb dressing.', veg_type: 'non-veg', price: 109, popular: 1, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Malai Kebab Roll', description: 'Melt-in-mouth creamy malai chicken kebab wrapped in buttery lachha paratha.', veg_type: 'non-veg', price: 129, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Afghani Cheesy Roll', description: 'Rich Afghani style chicken loaded with liquid cheese & crushed black pepper.', veg_type: 'non-veg', price: 129, popular: 1, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Chatpata SP Roll', description: 'Tangy, extra spiced chicken roll with green chillies & lemon zest.', veg_type: 'non-veg', price: 149, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Taco SP Roll', description: 'Crunchy taco shell wrapped inside soft wrap with spiced chicken & cheese.', veg_type: 'non-veg', price: 149, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Chicken 65 Sushi Roll', description: 'Innovative Indo-French fusion chicken 65 styled roll wrapped in delicate paper.', veg_type: 'non-veg', price: 149, popular: 1, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'Crispy Jumbo Roll', description: 'Extra giant roll stuffed with double crispy chicken tenders & extra cheese.', veg_type: 'non-veg', price: 149, popular: 0, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
    { category_id: 6, name: 'FB Jumbo Roll', description: 'King-size French Bell signature jumbo roll packed with chicken, egg & cheese.', veg_type: 'non-veg', price: 149, popular: 1, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },

    // Loaded
    { category_id: 7, name: 'Normal Loaded', description: 'Crispy fries topped with seasoned chicken pops, garlic mayo and liquid cheese.', veg_type: 'non-veg', price: 130, popular: 0, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 7, name: 'Peri Peri Loaded', description: 'Fries and crispy chicken bites tossed in fiery peri peri seasoning & cheese sauce.', veg_type: 'non-veg', price: 149, popular: 1, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 7, name: 'Kung-Fu Loaded', description: 'Asian sweet & spicy glazed chicken bites served over crispy loaded fries.', veg_type: 'non-veg', price: 179, popular: 0, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 7, name: 'Cheesy Blaster Loaded', description: 'Explosive molten cheese lava poured over crispy chicken strips & fries.', veg_type: 'non-veg', price: 179, popular: 1, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },
    { category_id: 7, name: 'Frenchy Cheesy SP Loaded', description: 'Chef Special loaded bowl with chicken, nuggets, fries, double cheese & dip.', veg_type: 'non-veg', price: 179, popular: 1, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80' },

    // Platters
    { category_id: 8, name: 'Veg Platter', description: 'Grand platter featuring classic fries, veg momos, veg sandwich bites & dips.', veg_type: 'veg', price: 179, popular: 0, image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80' },
    { category_id: 8, name: 'Fusion Platter', description: 'Assorted crispy chicken strips, peri peri fries, fried momos & house sauces.', veg_type: 'non-veg', price: 199, popular: 1, image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80' },
    { category_id: 8, name: 'Arabic Platter', description: 'Middle-Eastern inspired platter with grilled kebabs, garlic toum, pita & fries.', veg_type: 'non-veg', price: 249, popular: 1, image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80' },
    { category_id: 8, name: 'Mixed Platter', description: 'The ultimate sampler: chicken burger cut, nuggets, peri peri momos & cheesy fries.', veg_type: 'non-veg', price: 199, popular: 1, image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const item of menuItems) {
    await db.run(`
      INSERT INTO menu_items (category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
      item.category_id,
      item.name,
      item.description,
      item.image_url,
      item.veg_type,
      item.price,
      item.price_chicken || null,
      item.price_veg || null,
      item.popular
    ]);
  }

  // 5. Offers
  const offers = [
    { title: 'Ding! 10% Off Cravings', description: 'Get 10% off on all orders above ₹199', coupon_code: 'DING10', discount_type: 'percentage', discount_value: 10, minimum_order: 199 },
    { title: 'Flat ₹50 Off Special', description: 'Enjoy flat ₹50 off on orders above ₹299', coupon_code: 'BELLFB', discount_type: 'fixed', discount_value: 50, minimum_order: 299 },
    { title: 'Welcome Feast', description: 'Flat ₹30 off for new bell lovers on minimum ₹150', coupon_code: 'WELCOME30', discount_type: 'fixed', discount_value: 30, minimum_order: 150 }
  ];
  for (const off of offers) {
    await db.run(`
      INSERT INTO offers (title, description, coupon_code, discount_type, discount_value, minimum_order, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [off.title, off.description, off.coupon_code, off.discount_type, off.discount_value, off.minimum_order]);
  }

  // 6. Banners / Advertisements
  const adverts = [
    { title: 'Free Delivery Within 2 KM!', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80', description: 'Order your favorite loaded fries & burgers straight to your doorstep.', cta: 'Order Now' },
    { title: 'Crispy Zinger & Loaded Combo', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80', description: 'Try our best-selling Cheesy Blaster Loaded with Double Zinger!', cta: 'Explore Menu' },
    { title: 'French Bell Special Sushi Rolls', image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1000&q=80', description: 'Indo-French Fusion rolls starting at just ₹89.', cta: 'View Rolls' }
  ];
  for (const ad of adverts) {
    await db.run(`
      INSERT INTO advertisements (title, image_url, description, cta, active)
      VALUES (?, ?, ?, ?, 1)
    `, [ad.title, ad.image_url, ad.description, ad.cta]);
  }

  // 7. Seed Initial Orders for Live Order Board & Analytics Demonstration
  const sampleOrders = [
    {
      order_number: 'FB1040',
      user_id: 2,
      order_type: 'delivery',
      customer_name: 'Priya Sundaram',
      phone: '9876501234',
      delivery_address: 'Flat 302, Green Glen Apartments, K. Narayanpura',
      landmark: 'Near SBI ATM',
      pincode: '560077',
      subtotal: 268.00,
      discount: 26.80,
      delivery_charge: 0.00,
      total: 241.20,
      payment_status: 'paid',
      payment_method: 'upi',
      order_status: 'received',
      items: [
        { menu_item_id: 11, item_name: 'Zinger Burger', quantity: 2, unit_price: 99, total_price: 198 },
        { menu_item_id: 2, item_name: 'Peri Peri Fries', quantity: 1, unit_price: 70, total_price: 70 }
      ]
    },
    {
      order_number: 'FB1041',
      user_id: 2,
      order_type: 'dine-in',
      table_number: '04',
      num_people: 2,
      customer_name: 'Amit Patel',
      phone: '9811223344',
      subtotal: 358.00,
      discount: 0.00,
      delivery_charge: 0.00,
      total: 358.00,
      payment_status: 'paid',
      payment_method: 'card',
      order_status: 'preparing',
      items: [
        { menu_item_id: 32, item_name: 'Cheesy Blaster Loaded', quantity: 1, unit_price: 179, total_price: 179 },
        { menu_item_id: 34, item_name: 'Fusion Platter', quantity: 1, unit_price: 199, total_price: 199 }
      ]
    },
    {
      order_number: 'FB1042',
      user_id: 2,
      order_type: 'takeaway',
      customer_name: 'Sara Khan',
      phone: '9988776655',
      pickup_time: '20 mins',
      subtotal: 218.00,
      discount: 30.00,
      delivery_charge: 0.00,
      total: 188.00,
      payment_status: 'paid',
      payment_method: 'upi',
      order_status: 'ready',
      items: [
        { menu_item_id: 21, item_name: 'FB Chicken Roll', quantity: 2, unit_price: 109, total_price: 218 }
      ]
    },
    {
      order_number: 'FB1039',
      user_id: 2,
      order_type: 'delivery',
      customer_name: 'Vikram Singh',
      phone: '9765432109',
      delivery_address: 'Villa 12, Palm Meadows, K. Narayanpura',
      pincode: '560077',
      subtotal: 448.00,
      discount: 50.00,
      delivery_charge: 0.00,
      total: 398.00,
      payment_status: 'paid',
      payment_method: 'upi',
      order_status: 'completed',
      items: [
        { menu_item_id: 35, item_name: 'Arabic Platter', quantity: 1, unit_price: 249, total_price: 249 },
        { menu_item_id: 13, item_name: 'Cheesy Alfredo Burger', quantity: 1, unit_price: 179, total_price: 179 }
      ]
    }
  ];

  for (const o of sampleOrders) {
    const res = await db.run(`
      INSERT INTO orders (order_number, user_id, order_type, table_number, num_people, customer_name, phone, pickup_time, delivery_address, landmark, pincode, subtotal, discount, delivery_charge, total, payment_status, payment_method, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.order_number, o.user_id, o.order_type, o.table_number || null, o.num_people || null,
      o.customer_name, o.phone, o.pickup_time || null, o.delivery_address || null, o.landmark || null,
      o.pincode || null, o.subtotal, o.discount, o.delivery_charge, o.total, o.payment_status, o.payment_method, o.order_status
    ]);
    const orderId = res.lastID;

    for (const item of o.items) {
      await db.run(`
        INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, item.menu_item_id, item.item_name, item.quantity, item.unit_price, item.total_price]);
    }

    await db.run(`
      INSERT INTO payments (order_id, transaction_id, amount, method, status)
      VALUES (?, ?, ?, ?, ?)
    `, [orderId, 'TXN_' + o.order_number + '_' + Date.now(), o.total, o.payment_method, o.payment_status]);

    await db.run(`
      INSERT INTO receipts (order_id, whatsapp_status)
      VALUES (?, 'sent')
    `, [orderId]);
  }

  console.log('✅ French Bell Database Seeding Complete!');
}

seedDatabase().catch(err => {
  console.error('❌ Seeding Error:', err);
});
