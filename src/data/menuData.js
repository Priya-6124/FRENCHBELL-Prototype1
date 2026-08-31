// Official French Bell Cafe Menu Data with High Quality AI-Generated & Local Food Assets

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Starters', slug: 'starters', display_order: 1, icon: '🍟' },
  { id: 2, name: 'Strips', slug: 'strips', display_order: 2, icon: '🍗' },
  { id: 3, name: 'Momos', slug: 'momos', display_order: 3, icon: '🥟' },
  { id: 4, name: 'Burgers', slug: 'burgers', display_order: 4, icon: '🍔' },
  { id: 5, name: 'Sandwich', slug: 'sandwich', display_order: 5, icon: '🥪' },
  { id: 6, name: 'Rolls', slug: 'rolls', display_order: 6, icon: '🌯' },
  { id: 7, name: 'Loaded', slug: 'loaded', display_order: 7, icon: '🧀' },
  { id: 8, name: 'Platters', slug: 'platters', display_order: 8, icon: '🍱' }
];

export const INITIAL_MENU_ITEMS = [
  // STARTERS
  { id: 1, category_id: 1, category_slug: 'starters', name: 'Classic Fries', description: 'Crispy golden French fries tossed with sea salt & served with house dip.', veg_type: 'veg', price: 60, popular: 1, available: 1, image_url: '/assets/food/fries.jpg' },
  { id: 2, category_id: 1, category_slug: 'starters', name: 'Peri Peri Fries', description: 'Crispy fries liberally dusted with signature spicy French Bell peri peri seasoning.', veg_type: 'veg', price: 70, popular: 1, available: 1, image_url: '/assets/food/fries.jpg' },
  { id: 3, category_id: 1, category_slug: 'starters', name: 'Cheesy Fries', description: 'Golden fries smothered in warm molten cheddar cheese sauce and garlic herbs.', veg_type: 'veg', price: 80, popular: 0, available: 1, image_url: '/assets/food/fries.jpg' },
  { id: 4, category_id: 1, category_slug: 'starters', name: 'Nuggets', description: 'Bite-sized crunchy chicken nuggets seasoned to perfection with tangy mayo.', veg_type: 'non-veg', price: 70, popular: 0, available: 1, image_url: '/assets/food/nuggets.jpg' },

  // STRIPS
  { id: 5, category_id: 2, category_slug: 'strips', name: 'Crispy Classic Strips', description: 'Tender chicken breast strips battered and fried till super crispy.', veg_type: 'non-veg', price: 129, popular: 1, available: 1, image_url: '/assets/food/strips.jpg' },
  { id: 6, category_id: 2, category_slug: 'strips', name: 'Peri Peri Strips', description: 'Crispy strips glazed in fiery African bird-eye chilli peri peri spice mix.', veg_type: 'non-veg', price: 130, popular: 0, available: 1, image_url: '/assets/food/strips.jpg' },
  { id: 7, category_id: 2, category_slug: 'strips', name: 'Thai Honey Strips', description: 'Golden chicken strips tossed in sweet Thai honey chili glaze & toasted sesame.', veg_type: 'non-veg', price: 149, popular: 1, available: 1, image_url: '/assets/food/strips.jpg' },
  { id: 8, category_id: 2, category_slug: 'strips', name: 'Dynamite Strips', description: 'Extra spicy chicken strips coated in dynamite aioli sauce.', veg_type: 'non-veg', price: 149, popular: 1, available: 1, image_url: '/assets/food/strips.jpg' },

  // MOMOS (Chicken / Veg selectable)
  { id: 9, category_id: 3, category_slug: 'momos', name: 'Fried Momos', description: 'Crispy fried dumplings packed with savory filling & spicy red chutney.', veg_type: 'non-veg', price: 80, price_chicken: 80, price_veg: 70, popular: 1, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 10, category_id: 3, category_slug: 'momos', name: 'Peri Peri Momos', description: 'Deep fried momos tossed in spicy peri peri dry rub and mint dip.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 11, category_id: 3, category_slug: 'momos', name: 'Dynamite Momos', description: 'Momos drenched in explosive dynamite garlic cream sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 12, category_id: 3, category_slug: 'momos', name: 'Kanthari Momos', description: 'Spicy Kerala bird-eye kanthari chilli infused momos with cream sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 13, category_id: 3, category_slug: 'momos', name: 'BBQ Momos', description: 'Smoky hickory barbecue tossed momos garnished with spring onions.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 14, category_id: 3, category_slug: 'momos', name: 'Honey Chilli Momos', description: 'Crispy momos coated in sticky honey chilli garlic sauce.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 1, available: 1, image_url: '/assets/food/momos.jpg' },
  { id: 15, category_id: 3, category_slug: 'momos', name: 'Schezwan Momos', description: 'Wok tossed momos in extra fiery Schezwan chilli garlic relish.', veg_type: 'non-veg', price: 100, price_chicken: 100, price_veg: 80, popular: 0, available: 1, image_url: '/assets/food/momos.jpg' },

  // BURGERS
  { id: 16, category_id: 4, category_slug: 'burgers', name: 'Veg Burger', description: 'Crispy vegetable patty with fresh lettuce, tomato, cheese and signature mayo.', veg_type: 'veg', price: 79, popular: 0, available: 1, image_url: '/assets/food/burger.jpg' },
  { id: 17, category_id: 4, category_slug: 'burgers', name: 'Chicken Burger', description: 'Juicy seasoned chicken patty topped with caramelized onions and house relish.', veg_type: 'non-veg', price: 89, popular: 1, available: 1, image_url: '/assets/food/burger.jpg' },
  { id: 18, category_id: 4, category_slug: 'burgers', name: 'Zinger Burger', description: 'Extra crunchy fried chicken fillet layered with crunchy lettuce & spicy zinger sauce.', veg_type: 'non-veg', price: 99, popular: 1, available: 1, image_url: '/assets/food/burger.jpg' },
  { id: 19, category_id: 4, category_slug: 'burgers', name: 'Double Chicken Burger', description: 'Double juicy chicken patties stacked with double melted cheese slices.', veg_type: 'non-veg', price: 139, popular: 0, available: 1, image_url: '/assets/food/burger.jpg' },
  { id: 20, category_id: 4, category_slug: 'burgers', name: 'Double Zinger Burger', description: 'Two mammoth crunchy zinger fillets packed inside soft toasted brioche.', veg_type: 'non-veg', price: 159, popular: 1, available: 1, image_url: '/assets/food/burger.jpg' },
  { id: 21, category_id: 4, category_slug: 'burgers', name: 'Cheesy Alfredo Burger', description: 'Gourmet chicken burger dripping in velvety white Alfredo cheese sauce.', veg_type: 'non-veg', price: 179, popular: 1, available: 1, image_url: '/assets/food/burger.jpg' },

  // SANDWICH
  { id: 22, category_id: 5, category_slug: 'sandwich', name: 'Veg Sandwich', description: 'Freshly toasted bread stuffed with crunchy garden vegetables & herb mayo.', veg_type: 'veg', price: 69, popular: 0, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 23, category_id: 5, category_slug: 'sandwich', name: 'Veg Club Sandwich', description: 'Triple decker toasted sandwich packed with paneer, veggies, cheese & spread.', veg_type: 'veg', price: 89, popular: 0, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 24, category_id: 5, category_slug: 'sandwich', name: 'Chicken Sandwich', description: 'Shredded roasted chicken tossed in creamy pepper mayonnaise.', veg_type: 'non-veg', price: 99, popular: 0, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 25, category_id: 5, category_slug: 'sandwich', name: 'Chicken Club Sandwich', description: 'Triple tier classic club with chicken, egg, lettuce, tomato & melted cheddar.', veg_type: 'non-veg', price: 119, popular: 1, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 26, category_id: 5, category_slug: 'sandwich', name: 'Crispy Chicken Sandwich', description: 'Golden crispy chicken tender on grilled buttered bread with spicy dip.', veg_type: 'non-veg', price: 129, popular: 0, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 27, category_id: 5, category_slug: 'sandwich', name: 'Crispy Chicken Club Sandwich', description: 'Loaded triple club featuring crispy chicken strips, cheese and smoked relish.', veg_type: 'non-veg', price: 149, popular: 0, available: 1, image_url: '/assets/food/sandwich.jpg' },
  { id: 28, category_id: 5, category_slug: 'sandwich', name: 'Nachos Crispy Club Sandwich', description: 'Ultimate club loaded with crunchy nachos, crispy chicken & melted cheese lava.', veg_type: 'non-veg', price: 169, popular: 1, available: 1, image_url: '/assets/food/sandwich.jpg' },

  // ROLLS
  { id: 29, category_id: 6, category_slug: 'rolls', name: 'Veg Roll', description: 'Flaky paratha loaded with spiced veggies, onions and tangy mint chutney.', veg_type: 'veg', price: 89, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 30, category_id: 6, category_slug: 'rolls', name: 'Paneer Roll', description: 'Char-grilled cottage cheese cubes wrapped in layered flaky bread with spices.', veg_type: 'veg', price: 90, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 31, category_id: 6, category_slug: 'rolls', name: 'Mexican Roll', description: 'Zesty Mexican seasoned paneer/veggies with salsa & melted jalapeño cheese.', veg_type: 'veg', price: 109, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 32, category_id: 6, category_slug: 'rolls', name: 'Crispy Chicken Roll', description: 'Crunchy chicken tenders rolled with pickled onions & garlic cream sauce.', veg_type: 'non-veg', price: 109, popular: 1, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 33, category_id: 6, category_slug: 'rolls', name: 'FB Chicken Roll', description: 'French Bell signature spiced roasted chicken roll with secret herb dressing.', veg_type: 'non-veg', price: 109, popular: 1, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 34, category_id: 6, category_slug: 'rolls', name: 'Malai Kebab Roll', description: 'Melt-in-mouth creamy malai chicken kebab wrapped in buttery lachha paratha.', veg_type: 'non-veg', price: 129, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 35, category_id: 6, category_slug: 'rolls', name: 'Afghani Cheesy Roll', description: 'Rich Afghani style chicken loaded with liquid cheese & crushed black pepper.', veg_type: 'non-veg', price: 129, popular: 1, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 36, category_id: 6, category_slug: 'rolls', name: 'Chatpata SP Roll', description: 'Tangy, extra spiced chicken roll with green chillies & lemon zest.', veg_type: 'non-veg', price: 149, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 37, category_id: 6, category_slug: 'rolls', name: 'Taco SP Roll', description: 'Crunchy taco shell wrapped inside soft wrap with spiced chicken & cheese.', veg_type: 'non-veg', price: 149, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 38, category_id: 6, category_slug: 'rolls', name: 'Chicken 65 Sushi Roll', description: 'Innovative Indo-French fusion chicken 65 styled roll wrapped in delicate paper.', veg_type: 'non-veg', price: 149, popular: 1, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 39, category_id: 6, category_slug: 'rolls', name: 'Crispy Jumbo Roll', description: 'Extra giant roll stuffed with double crispy chicken tenders & extra cheese.', veg_type: 'non-veg', price: 149, popular: 0, available: 1, image_url: '/assets/food/rolls.jpg' },
  { id: 40, category_id: 6, category_slug: 'rolls', name: 'FB Jumbo Roll', description: 'King-size French Bell signature jumbo roll packed with chicken, egg & cheese.', veg_type: 'non-veg', price: 149, popular: 1, available: 1, image_url: '/assets/food/rolls.jpg' },

  // LOADED
  { id: 41, category_id: 7, category_slug: 'loaded', name: 'Normal Loaded', description: 'Crispy fries topped with seasoned chicken pops, garlic mayo and liquid cheese.', veg_type: 'non-veg', price: 130, popular: 0, available: 1, image_url: '/assets/food/loaded.jpg' },
  { id: 42, category_id: 7, category_slug: 'loaded', name: 'Peri Peri Loaded', description: 'Fries and crispy chicken bites tossed in fiery peri peri seasoning & cheese sauce.', veg_type: 'non-veg', price: 149, popular: 1, available: 1, image_url: '/assets/food/loaded.jpg' },
  { id: 43, category_id: 7, category_slug: 'loaded', name: 'Kung-Fu Loaded', description: 'Asian sweet & spicy glazed chicken bites served over crispy loaded fries.', veg_type: 'non-veg', price: 179, popular: 0, available: 1, image_url: '/assets/food/loaded.jpg' },
  { id: 44, category_id: 7, category_slug: 'loaded', name: 'Cheesy Blaster Loaded', description: 'Explosive molten cheese lava poured over crispy chicken strips & fries.', veg_type: 'non-veg', price: 179, popular: 1, available: 1, image_url: '/assets/food/loaded.jpg' },
  { id: 45, category_id: 7, category_slug: 'loaded', name: 'Frenchy Cheesy SP Loaded', description: 'Chef Special loaded bowl with chicken, nuggets, fries, double cheese & dip.', veg_type: 'non-veg', price: 179, popular: 1, available: 1, image_url: '/assets/food/loaded.jpg' },

  // PLATTERS
  { id: 46, category_id: 8, category_slug: 'platters', name: 'Veg Platter', description: 'Grand platter featuring classic fries, veg momos, veg sandwich bites & dips.', veg_type: 'veg', price: 179, popular: 0, available: 1, image_url: '/assets/food/platter.jpg' },
  { id: 47, category_id: 8, category_slug: 'platters', name: 'Fusion Platter', description: 'Assorted crispy chicken strips, peri peri fries, fried momos & house sauces.', veg_type: 'non-veg', price: 199, popular: 1, available: 1, image_url: '/assets/food/platter.jpg' },
  { id: 48, category_id: 8, category_slug: 'platters', name: 'Arabic Platter', description: 'Middle-Eastern inspired platter with grilled kebabs, garlic toum, pita & fries.', veg_type: 'non-veg', price: 249, popular: 1, available: 1, image_url: '/assets/food/platter.jpg' },
  { id: 49, category_id: 8, category_slug: 'platters', name: 'Mixed Platter', description: 'The ultimate sampler: chicken burger cut, nuggets, peri peri momos & cheesy fries.', veg_type: 'non-veg', price: 199, popular: 1, available: 1, image_url: '/assets/food/platter.jpg' },
];
