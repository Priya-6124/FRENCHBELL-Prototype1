// Official FrenchBell Cafe Menu Data with Individual High-Quality Food Photography
// Total 49 items across 8 categories with accurate prices and zero emojis

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Starters', slug: 'starters', display_order: 1, icon: 'Utensils' },
  { id: 2, name: 'Strips', slug: 'strips', display_order: 2, icon: 'Drumstick' },
  { id: 3, name: 'Momos', slug: 'momos', display_order: 3, icon: 'CircleDot' },
  { id: 4, name: 'Burgers', slug: 'burgers', display_order: 4, icon: 'Sandwich' },
  { id: 5, name: 'Sandwich', slug: 'sandwich', display_order: 5, icon: 'Layers' },
  { id: 6, name: 'Rolls', slug: 'rolls', display_order: 6, icon: 'Sparkles' },
  { id: 7, name: 'Loaded', slug: 'loaded', display_order: 7, icon: 'Flame' },
  { id: 8, name: 'Platters', slug: 'platters', display_order: 8, icon: 'Boxes' }
];

export const INITIAL_MENU_ITEMS = [
  // 1. STARTERS (4 items)
  {
    id: 1, category_id: 1, category_slug: 'starters',
    name: 'Classic Fries',
    description: 'Crispy golden French fries tossed with sea salt & served with house dip.',
    veg_type: 'veg', price: 60, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2, category_id: 1, category_slug: 'starters',
    name: 'Peri Peri Fries',
    description: 'Crispy fries liberally dusted with signature spicy FrenchBell peri peri seasoning.',
    veg_type: 'veg', price: 70, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3, category_id: 1, category_slug: 'starters',
    name: 'Cheesy Fries',
    description: 'Golden fries smothered in warm molten cheddar cheese sauce and garlic herbs.',
    veg_type: 'veg', price: 80, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4, category_id: 1, category_slug: 'starters',
    name: 'Nuggets',
    description: 'Bite-sized crunchy chicken nuggets seasoned to perfection with tangy mayo.',
    veg_type: 'non-veg', price: 70, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
  },

  // 2. STRIPS (4 items)
  {
    id: 5, category_id: 2, category_slug: 'strips',
    name: 'Crispy Classic Strips',
    description: 'Tender chicken breast strips battered and fried till super crispy.',
    veg_type: 'non-veg', price: 129, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6, category_id: 2, category_slug: 'strips',
    name: 'Peri Peri Strips',
    description: 'Crispy strips glazed in fiery African bird-eye chilli peri peri spice mix.',
    veg_type: 'non-veg', price: 130, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7, category_id: 2, category_slug: 'strips',
    name: 'Thai Honey Strips',
    description: 'Golden chicken strips tossed in sweet Thai honey chili glaze & toasted sesame.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1527477378408-1bc0f605cc9e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8, category_id: 2, category_slug: 'strips',
    name: 'Dynamite Strips',
    description: 'Extra spicy chicken strips coated in explosive dynamite aioli sauce.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80'
  },

  // 3. MOMOS (7 items with Chicken & Veg selectable pricing)
  {
    id: 9, category_id: 3, category_slug: 'momos',
    name: 'Fried Momos',
    description: 'Crispy golden dumplings packed with savory filling & spicy red chilli chutney.',
    veg_type: 'non-veg', price: 80, price_chicken: 80, price_veg: 70, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 10, category_id: 3, category_slug: 'momos',
    name: 'Peri Peri Momos',
    description: 'Deep fried momos tossed in spicy peri peri dry rub and mint dip.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 11, category_id: 3, category_slug: 'momos',
    name: 'Dynamite Momos',
    description: 'Momos drenched in explosive dynamite garlic cream sauce.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 12, category_id: 3, category_slug: 'momos',
    name: 'Kanthari Momos',
    description: 'Spicy Kerala bird-eye kanthari chilli infused momos with cream sauce.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1625242661157-e6f9872506bb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 13, category_id: 3, category_slug: 'momos',
    name: 'BBQ Momos',
    description: 'Smoky hickory barbecue tossed momos garnished with fresh spring onions.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 14, category_id: 3, category_slug: 'momos',
    name: 'Honey Chilli Momos',
    description: 'Crispy momos coated in sticky honey chilli garlic glaze.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 15, category_id: 3, category_slug: 'momos',
    name: 'Schezwan Momos',
    description: 'Wok tossed momos in extra fiery Schezwan chilli garlic relish.',
    veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'
  },

  // 4. BURGERS (6 items)
  {
    id: 16, category_id: 4, category_slug: 'burgers',
    name: 'Veg Burger',
    description: 'Crispy vegetable patty with fresh lettuce, tomato, cheese and signature herb mayo.',
    veg_type: 'veg', price: 79, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 17, category_id: 4, category_slug: 'burgers',
    name: 'Chicken Burger',
    description: 'Juicy seasoned chicken patty topped with caramelized onions and house relish.',
    veg_type: 'non-veg', price: 89, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 18, category_id: 4, category_slug: 'burgers',
    name: 'Zinger Burger',
    description: 'Extra crunchy fried chicken fillet layered with crunchy lettuce & spicy zinger sauce.',
    veg_type: 'non-veg', price: 99, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 19, category_id: 4, category_slug: 'burgers',
    name: 'Double Chicken Burger',
    description: 'Double juicy chicken patties stacked with double melted cheddar cheese slices.',
    veg_type: 'non-veg', price: 139, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 20, category_id: 4, category_slug: 'burgers',
    name: 'Double Zinger Burger',
    description: 'Two mammoth crunchy zinger fillets packed inside soft toasted brioche.',
    veg_type: 'non-veg', price: 159, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 21, category_id: 4, category_slug: 'burgers',
    name: 'Cheesy Alfredo Burger',
    description: 'Gourmet chicken burger dripping in velvety white Alfredo cheese sauce.',
    veg_type: 'non-veg', price: 179, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80'
  },

  // 5. SANDWICH (7 items)
  {
    id: 22, category_id: 5, category_slug: 'sandwich',
    name: 'Veg Sandwich',
    description: 'Freshly toasted bread stuffed with crunchy garden vegetables & herb mayo.',
    veg_type: 'veg', price: 69, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 23, category_id: 5, category_slug: 'sandwich',
    name: 'Veg Club Sandwich',
    description: 'Triple decker toasted sandwich packed with paneer, veggies, cheese & spread.',
    veg_type: 'veg', price: 89, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 24, category_id: 5, category_slug: 'sandwich',
    name: 'Chicken Sandwich',
    description: 'Shredded roasted chicken tossed in creamy pepper mayonnaise.',
    veg_type: 'non-veg', price: 99, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 25, category_id: 5, category_slug: 'sandwich',
    name: 'Chicken Club Sandwich',
    description: 'Triple tier classic club with chicken, egg, lettuce, tomato & melted cheddar.',
    veg_type: 'non-veg', price: 119, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 26, category_id: 5, category_slug: 'sandwich',
    name: 'Crispy Chicken Sandwich',
    description: 'Golden crispy chicken tender on grilled buttered bread with spicy dip.',
    veg_type: 'non-veg', price: 129, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 27, category_id: 5, category_slug: 'sandwich',
    name: 'Crispy Chicken Club Sandwich',
    description: 'Loaded triple club featuring crispy chicken strips, cheese and smoked relish.',
    veg_type: 'non-veg', price: 149, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 28, category_id: 5, category_slug: 'sandwich',
    name: 'Nachos Crispy Club Sandwich',
    description: 'Ultimate club loaded with crunchy nachos, crispy chicken & melted cheese lava.',
    veg_type: 'non-veg', price: 169, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'
  },

  // 6. ROLLS (12 items)
  {
    id: 29, category_id: 6, category_slug: 'rolls',
    name: 'Veg Roll',
    description: 'Flaky paratha loaded with spiced veggies, onions and tangy mint chutney.',
    veg_type: 'veg', price: 89, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 30, category_id: 6, category_slug: 'rolls',
    name: 'Paneer Roll',
    description: 'Char-grilled cottage cheese cubes wrapped in layered flaky bread with spices.',
    veg_type: 'veg', price: 90, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 31, category_id: 6, category_slug: 'rolls',
    name: 'Mexican Roll',
    description: 'Zesty Mexican seasoned paneer/veggies with salsa & melted jalapeño cheese.',
    veg_type: 'veg', price: 109, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 32, category_id: 6, category_slug: 'rolls',
    name: 'Crispy Chicken Roll',
    description: 'Crunchy chicken tenders rolled with pickled onions & garlic cream sauce.',
    veg_type: 'non-veg', price: 109, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 33, category_id: 6, category_slug: 'rolls',
    name: 'FB Chicken Roll',
    description: 'FrenchBell signature spiced roasted chicken roll with secret herb dressing.',
    veg_type: 'non-veg', price: 109, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 34, category_id: 6, category_slug: 'rolls',
    name: 'Malai Kebab Roll',
    description: 'Melt-in-mouth creamy malai chicken kebab wrapped in buttery lachha paratha.',
    veg_type: 'non-veg', price: 129, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 35, category_id: 6, category_slug: 'rolls',
    name: 'Afghani Cheesy Roll',
    description: 'Rich Afghani style chicken loaded with liquid cheese & crushed black pepper.',
    veg_type: 'non-veg', price: 129, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 36, category_id: 6, category_slug: 'rolls',
    name: 'Chatpata SP Roll',
    description: 'Tangy, extra spiced chicken roll with green chillies & fresh lemon zest.',
    veg_type: 'non-veg', price: 149, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 37, category_id: 6, category_slug: 'rolls',
    name: 'Taco SP Roll',
    description: 'Crunchy taco shell wrapped inside soft wrap with spiced chicken & cheese.',
    veg_type: 'non-veg', price: 149, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 38, category_id: 6, category_slug: 'rolls',
    name: 'Chicken 65 Sushi Roll',
    description: 'Innovative Indo-French fusion chicken 65 styled roll wrapped in delicate crust.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 39, category_id: 6, category_slug: 'rolls',
    name: 'Crispy Jumbo Roll',
    description: 'Extra giant roll stuffed with double crispy chicken tenders & extra cheese.',
    veg_type: 'non-veg', price: 149, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 40, category_id: 6, category_slug: 'rolls',
    name: 'FB Jumbo Roll',
    description: 'King-size FrenchBell signature jumbo roll packed with chicken, egg & cheese.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },

  // 7. LOADED (5 items)
  {
    id: 41, category_id: 7, category_slug: 'loaded',
    name: 'Normal Loaded',
    description: 'Crispy fries topped with seasoned chicken pops, garlic mayo and liquid cheese.',
    veg_type: 'non-veg', price: 130, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 42, category_id: 7, category_slug: 'loaded',
    name: 'Peri Peri Loaded',
    description: 'Fries and crispy chicken bites tossed in fiery peri peri seasoning & cheese sauce.',
    veg_type: 'non-veg', price: 149, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 43, category_id: 7, category_slug: 'loaded',
    name: 'Kung-Fu Loaded',
    description: 'Asian sweet & spicy glazed chicken bites served over crispy loaded fries.',
    veg_type: 'non-veg', price: 179, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 44, category_id: 7, category_slug: 'loaded',
    name: 'Cheesy Blaster Loaded',
    description: 'Explosive molten cheese lava poured over crispy chicken strips & fries.',
    veg_type: 'non-veg', price: 179, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 45, category_id: 7, category_slug: 'loaded',
    name: 'Frenchy Cheesy SP Loaded',
    description: 'Chef Special loaded bowl with chicken, nuggets, fries, double cheese & house dip.',
    veg_type: 'non-veg', price: 179, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1518013034458-30b0ee243591?auto=format&fit=crop&w=600&q=80'
  },

  // 8. PLATTERS (4 items)
  {
    id: 46, category_id: 8, category_slug: 'platters',
    name: 'Veg Platter',
    description: 'Grand platter featuring classic fries, veg momos, veg sandwich bites & dips.',
    veg_type: 'veg', price: 179, popular: 0, available: 1,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 47, category_id: 8, category_slug: 'platters',
    name: 'Fusion Platter',
    description: 'Assorted crispy chicken strips, peri peri fries, fried momos & signature sauces.',
    veg_type: 'non-veg', price: 199, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 48, category_id: 8, category_slug: 'platters',
    name: 'Arabic Platter',
    description: 'Middle-Eastern inspired platter with grilled kebabs, garlic toum, pita & fries.',
    veg_type: 'non-veg', price: 249, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 49, category_id: 8, category_slug: 'platters',
    name: 'Mixed Platter',
    description: 'The ultimate sampler: chicken burger cut, nuggets, peri peri momos & cheesy fries.',
    veg_type: 'non-veg', price: 199, popular: 1, available: 1,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  }
];
