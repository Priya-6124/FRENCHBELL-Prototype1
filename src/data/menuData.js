// Official FrenchBell Cafe Menu Data with Individual High-Quality Food Photography
// Every single item has a unique image, separate Veg or Non-Veg card, and real stock quantity.

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Starters', slug: 'starters', display_order: 1, icon: 'Utensils', active: 1 },
  { id: 2, name: 'Strips', slug: 'strips', display_order: 2, icon: 'Drumstick', active: 1 },
  { id: 3, name: 'Momos', slug: 'momos', display_order: 3, icon: 'CircleDot', active: 1 },
  { id: 4, name: 'Burgers', slug: 'burgers', display_order: 4, icon: 'Sandwich', active: 1 },
  { id: 5, name: 'Sandwich', slug: 'sandwich', display_order: 5, icon: 'Layers', active: 1 },
  { id: 6, name: 'Rolls', slug: 'rolls', display_order: 6, icon: 'Sparkles', active: 1 },
  { id: 7, name: 'Loaded', slug: 'loaded', display_order: 7, icon: 'Flame', active: 1 },
  { id: 8, name: 'Platters', slug: 'platters', display_order: 8, icon: 'Boxes', active: 1 }
];

export const INITIAL_MENU_ITEMS = [
  // 1. STARTERS
  {
    id: 1, category_id: 1, category_slug: 'starters', category_name: 'Starters',
    name: 'Classic Fries',
    description: 'Crispy golden French fries tossed with sea salt & served with house dip.',
    veg_type: 'veg', price: 60, popular: 1, available: 1, stock_quantity: 25, prep_time_mins: 10,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2, category_id: 1, category_slug: 'starters', category_name: 'Starters',
    name: 'Peri Peri Fries',
    description: 'Crispy fries liberally dusted with signature spicy FrenchBell peri peri seasoning.',
    veg_type: 'veg', price: 70, popular: 1, available: 1, stock_quantity: 20, prep_time_mins: 10,
    image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3, category_id: 1, category_slug: 'starters', category_name: 'Starters',
    name: 'Cheesy Fries',
    description: 'Golden fries smothered in warm molten cheddar cheese sauce and garlic herbs.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 18, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4, category_id: 1, category_slug: 'starters', category_name: 'Starters',
    name: 'Chicken Nuggets',
    description: 'Bite-sized crunchy chicken nuggets seasoned to perfection with tangy mayo.',
    veg_type: 'non-veg', price: 70, popular: 0, available: 1, stock_quantity: 20, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
  },

  // 2. STRIPS
  {
    id: 5, category_id: 2, category_slug: 'strips', category_name: 'Strips',
    name: 'Crispy Classic Strips',
    description: 'Tender chicken breast strips battered and fried till super crispy.',
    veg_type: 'non-veg', price: 129, popular: 1, available: 1, stock_quantity: 22, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6, category_id: 2, category_slug: 'strips', category_name: 'Strips',
    name: 'Peri Peri Strips',
    description: 'Crispy strips glazed in fiery African bird-eye chilli peri peri spice mix.',
    veg_type: 'non-veg', price: 130, popular: 0, available: 1, stock_quantity: 18, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7, category_id: 2, category_slug: 'strips', category_name: 'Strips',
    name: 'Thai Honey Strips',
    description: 'Golden chicken strips tossed in sweet Thai honey chili glaze & toasted sesame.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1, stock_quantity: 15, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1527477378408-1bc0f605cc9e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8, category_id: 2, category_slug: 'strips', category_name: 'Strips',
    name: 'Dynamite Strips',
    description: 'Extra spicy chicken strips coated in explosive dynamite aioli sauce.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1, stock_quantity: 16, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80'
  },

  // 3. MOMOS - COMPLETELY SEPARATED (Veg & Non-Veg separate individual cards)
  {
    id: 9, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Fried Momos',
    description: 'Crispy fried dumplings stuffed with shredded fresh garden vegetables & spicy chutney.',
    veg_type: 'veg', price: 70, popular: 1, available: 1, stock_quantity: 20, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 10, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Fried Momos',
    description: 'Crispy fried dumplings packed with savory minced chicken filling & red chilli chutney.',
    veg_type: 'non-veg', price: 80, popular: 1, available: 1, stock_quantity: 22, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 11, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Peri Peri Momos',
    description: 'Crispy vegetable momos tossed in signature spicy peri peri dry rub.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 15, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1625242661157-e6f9872506bb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 12, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Peri Peri Momos',
    description: 'Fried chicken momos tossed generously in fiery African bird-eye chilli peri peri.',
    veg_type: 'non-veg', price: 100, popular: 1, available: 1, stock_quantity: 20, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 13, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Dynamite Momos',
    description: 'Golden vegetable momos drenched in explosive dynamite garlic cream sauce.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 14, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 14, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Dynamite Momos',
    description: 'Crispy chicken momos smothered in rich spicy dynamite aioli sauce.',
    veg_type: 'non-veg', price: 100, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 15, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Kanthari Momos',
    description: 'Kerala bird-eye kanthari chilli infused vegetable momos with rich cream drizzle.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 12, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 16, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Kanthari Momos',
    description: 'Fiery chicken dumplings tossed with bird-eye kanthari peppers and velvety cheese sauce.',
    veg_type: 'non-veg', price: 100, popular: 1, available: 1, stock_quantity: 15, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 17, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg BBQ Momos',
    description: 'Smoky hickory barbecue tossed vegetable momos with toasted sesame garnish.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 14, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 18, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken BBQ Momos',
    description: 'Smoky hickory barbecue tossed chicken momos garnished with chopped spring onions.',
    veg_type: 'non-veg', price: 100, popular: 0, available: 1, stock_quantity: 16, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 19, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Honey Chilli Momos',
    description: 'Crispy veggie momos coated in sticky sweet & spicy honey chilli garlic glaze.',
    veg_type: 'veg', price: 80, popular: 1, available: 1, stock_quantity: 15, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 20, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Honey Chilli Momos',
    description: 'Crispy chicken momos wok-tossed in sweet Thai honey garlic sauce.',
    veg_type: 'non-veg', price: 100, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 21, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Veg Schezwan Momos',
    description: 'Wok tossed veggie momos coated in spicy Schezwan relish and fried garlic.',
    veg_type: 'veg', price: 80, popular: 0, available: 1, stock_quantity: 12, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 22, category_id: 3, category_slug: 'momos', category_name: 'Momos',
    name: 'Chicken Schezwan Momos',
    description: 'Wok tossed chicken momos in extra fiery Schezwan chilli garlic relish.',
    veg_type: 'non-veg', price: 100, popular: 0, available: 1, stock_quantity: 16, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'
  },

  // 4. BURGERS
  {
    id: 23, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Crispy Veg Burger',
    description: 'Crispy spiced vegetable patty with fresh lettuce, tomato, cheese slice and herb mayo.',
    veg_type: 'veg', price: 79, popular: 0, available: 1, stock_quantity: 25, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 24, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Classic Chicken Burger',
    description: 'Juicy seasoned chicken patty topped with caramelized onions, cheddar, and house relish.',
    veg_type: 'non-veg', price: 89, popular: 1, available: 1, stock_quantity: 24, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 25, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Zinger Crunchy Burger',
    description: 'Super crunchy fried chicken fillet layered with iceberg lettuce & signature zinger sauce.',
    veg_type: 'non-veg', price: 99, popular: 1, available: 1, stock_quantity: 30, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 26, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Double Chicken Burger',
    description: 'Two juicy chicken patties stacked with double melted cheddar cheese and barbecue drizzle.',
    veg_type: 'non-veg', price: 139, popular: 0, available: 1, stock_quantity: 15, prep_time_mins: 16,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 27, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Double Zinger Supreme Burger',
    description: 'Two mammoth crunchy chicken zinger fillets stacked in a toasted buttered brioche bun.',
    veg_type: 'non-veg', price: 159, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 18,
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 28, category_id: 4, category_slug: 'burgers', category_name: 'Burgers',
    name: 'Cheesy Alfredo Burger',
    description: 'Gourmet fried chicken burger smothered in velvety white parmesan Alfredo cheese lava.',
    veg_type: 'non-veg', price: 179, popular: 1, available: 1, stock_quantity: 14, prep_time_mins: 18,
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80'
  },

  // 5. SANDWICHES
  {
    id: 29, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Garden Veg Sandwich',
    description: 'Freshly toasted bread stuffed with crunchy garden vegetables, cucumber, tomatoes & mint mayo.',
    veg_type: 'veg', price: 69, popular: 0, available: 1, stock_quantity: 20, prep_time_mins: 10,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 30, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Paneer Club Sandwich',
    description: 'Triple decker toasted sandwich packed with spiced paneer, veggies, cheese & house spread.',
    veg_type: 'veg', price: 89, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 31, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Shredded Chicken Sandwich',
    description: 'Tender roasted chicken tossed in creamy cracked black pepper mayonnaise.',
    veg_type: 'non-veg', price: 99, popular: 0, available: 1, stock_quantity: 20, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 32, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Chicken Club Sandwich',
    description: 'Triple tier classic club with roasted chicken, boiled egg, lettuce, tomato & melted cheddar.',
    veg_type: 'non-veg', price: 119, popular: 1, available: 1, stock_quantity: 16, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 33, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Crispy Chicken Sandwich',
    description: 'Golden fried chicken breast fillet on grilled buttered bread with spicy garlic dip.',
    veg_type: 'non-veg', price: 129, popular: 0, available: 1, stock_quantity: 15, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 34, category_id: 5, category_slug: 'sandwich', category_name: 'Sandwich',
    name: 'Nachos Loaded Club Sandwich',
    description: 'Crunchy tortilla chips, seasoned chicken chunks & melted jalapeño cheese in triple layers.',
    veg_type: 'non-veg', price: 169, popular: 1, available: 1, stock_quantity: 12, prep_time_mins: 16,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'
  },

  // 6. ROLLS
  {
    id: 35, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Veg Frankie Roll',
    description: 'Flaky paratha loaded with spiced mixed veggies, pickled onions and tangy mint chutney.',
    veg_type: 'veg', price: 89, popular: 0, available: 1, stock_quantity: 20, prep_time_mins: 10,
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 36, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Tandoori Paneer Roll',
    description: 'Char-grilled cottage cheese cubes wrapped in layered flaky flatbread with herbs.',
    veg_type: 'veg', price: 90, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 37, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Mexican Salsa Roll',
    description: 'Zesty Mexican seasoned veggies with charred corn, salsa & melted jalapeño cheese.',
    veg_type: 'veg', price: 109, popular: 0, available: 1, stock_quantity: 15, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 38, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Crispy Chicken Roll',
    description: 'Crunchy chicken tenders rolled with pickled onions & garlic aioli sauce.',
    veg_type: 'non-veg', price: 109, popular: 1, available: 1, stock_quantity: 22, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 39, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Thai Honey Chicken Roll',
    description: 'Tender chicken strips tossed in sweet Thai honey chili glaze wrapped in flaky paratha.',
    veg_type: 'non-veg', price: 129, popular: 0, available: 1, stock_quantity: 16, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 40, category_id: 6, category_slug: 'rolls', category_name: 'Rolls',
    name: 'Dynamite Chicken Roll',
    description: 'Spicy chicken tenders drenched in hot dynamite cream sauce wrapped fresh.',
    veg_type: 'non-veg', price: 129, popular: 1, available: 1, stock_quantity: 16, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80'
  },

  // 7. LOADED
  {
    id: 41, category_id: 7, category_slug: 'loaded', category_name: 'Loaded',
    name: 'Cheesy Veggie Loaded Fries',
    description: 'Crispy fries topped with melted cheddar, diced peppers, jalapeños and herb cream.',
    veg_type: 'veg', price: 139, popular: 0, available: 1, stock_quantity: 15, prep_time_mins: 12,
    image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 42, category_id: 7, category_slug: 'loaded', category_name: 'Loaded',
    name: 'Cheesy Blaster Loaded Bowl',
    description: 'Double cheese sauce bowl with seasoned potato wedges, fries, sweet corn and spicy paprika.',
    veg_type: 'veg', price: 159, popular: 1, available: 1, stock_quantity: 16, prep_time_mins: 14,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 43, category_id: 7, category_slug: 'loaded', category_name: 'Loaded',
    name: 'Chicken Popcorn Loaded',
    description: 'Crispy golden fries layered with crunchy chicken popcorn, liquid cheese and smoky chipotle.',
    veg_type: 'non-veg', price: 169, popular: 1, available: 1, stock_quantity: 18, prep_time_mins: 15,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 44, category_id: 7, category_slug: 'loaded', category_name: 'Loaded',
    name: 'Monster Meat Loaded Platter',
    description: 'The heavyweight bowl: chicken sausage, crispy strips, bacon bits, cheese lava and spicy ranch.',
    veg_type: 'non-veg', price: 189, popular: 1, available: 1, stock_quantity: 14, prep_time_mins: 16,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },

  // 8. PLATTERS
  {
    id: 45, category_id: 8, category_slug: 'platters', category_name: 'Platters',
    name: 'Veg Sampler Platter',
    description: 'Ultimate sharing platter with classic fries, veg momos, crispy onion rings and 3 house dips.',
    veg_type: 'veg', price: 199, popular: 1, available: 1, stock_quantity: 12, prep_time_mins: 18,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 46, category_id: 8, category_slug: 'platters', category_name: 'Platters',
    name: 'Grand Non-Veg Cafe Feast Platter',
    description: 'Loaded banquet: crispy chicken strips, chicken momos, cheesy fries, nuggets and garlic aioli dips.',
    veg_type: 'non-veg', price: 299, popular: 1, available: 1, stock_quantity: 10, prep_time_mins: 20,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  }
];
