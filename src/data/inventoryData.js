export const INITIAL_INVENTORY_ITEMS = [
  {
    id: 1,
    name: 'Brioche Burger Buns',
    category: 'Bakery',
    unit: 'units',
    current_stock: 45,
    min_threshold: 50,
    cost_per_unit: 18,
    supplier: 'Bangalore Artisan Breads',
    last_restocked: '2026-10-02',
    linked_dishes: ['Double Zinger Burger', 'Monster Crispy Burger', 'Classic French Burger']
  },
  {
    id: 2,
    name: 'Crispy Chicken Patties',
    category: 'Meat & Poultry',
    unit: 'units',
    current_stock: 18,
    min_threshold: 40,
    cost_per_unit: 45,
    supplier: 'FreshCatch & Meat Hub',
    last_restocked: '2026-10-01',
    linked_dishes: ['Double Zinger Burger', 'Monster Crispy Burger']
  },
  {
    id: 3,
    name: 'French Shoestring Potatoes (Fries)',
    category: 'Frozen & Sides',
    unit: 'kg',
    current_stock: 22,
    min_threshold: 20,
    cost_per_unit: 110,
    supplier: 'McCain Golden Supply',
    last_restocked: '2026-10-03',
    linked_dishes: ['Peri Peri French Fries', 'Loaded Cheese Fries', 'Cheesy Blaster Fries']
  },
  {
    id: 4,
    name: 'Mozzarella & Cheddar Cheese Blend',
    category: 'Dairy',
    unit: 'kg',
    current_stock: 8,
    min_threshold: 15,
    cost_per_unit: 420,
    supplier: 'Amul Dairy Dist',
    last_restocked: '2026-09-29',
    linked_dishes: ['Cheesy Blaster Loaded', 'Club Melt Sandwich', 'Gourmet French Pizza']
  },
  {
    id: 5,
    name: 'Momo Wrapper Sheets & Flour',
    category: 'Bakery',
    unit: 'pkts',
    current_stock: 12,
    min_threshold: 25,
    cost_per_unit: 65,
    supplier: 'Himalayan Food Co.',
    last_restocked: '2026-10-02',
    linked_dishes: ['Steamed Chicken Momos', 'Peri Peri Fried Momos', 'Kurkure Crispy Momos']
  },
  {
    id: 6,
    name: 'Peri Peri Gourmet Seasoning',
    category: 'Spices & Sauces',
    unit: 'kg',
    current_stock: 3.5,
    min_threshold: 5,
    cost_per_unit: 380,
    supplier: 'Keya Spices India',
    last_restocked: '2026-09-25',
    linked_dishes: ['Peri Peri French Fries', 'Peri Peri Momos', 'Spicy Crispy Strips']
  },
  {
    id: 7,
    name: 'Secret French Garlic Mayo',
    category: 'Spices & Sauces',
    unit: 'liters',
    current_stock: 14,
    min_threshold: 10,
    cost_per_unit: 190,
    supplier: 'Veeba Food Services',
    last_restocked: '2026-10-04',
    linked_dishes: ['All Burgers', 'Rolls', 'Sampler Platters']
  },
  {
    id: 8,
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Dairy',
    unit: 'kg',
    current_stock: 6,
    min_threshold: 12,
    cost_per_unit: 340,
    supplier: 'Nandini Dairy KMF',
    last_restocked: '2026-10-04',
    linked_dishes: ['Paneer Tikka Roll', 'Veggie Supreme Burger', 'Cheesy Paneer Momos']
  },
  {
    id: 9,
    name: 'Kathi Rumali Roll Wraps',
    category: 'Bakery',
    unit: 'units',
    current_stock: 35,
    min_threshold: 40,
    cost_per_unit: 8,
    supplier: 'Bangalore Artisan Breads',
    last_restocked: '2026-10-03',
    linked_dishes: ['FB Chicken Roll', 'Paneer Tikka Roll', 'Shawarma Roll']
  },
  {
    id: 10,
    name: 'FrenchBell Kraft Burger Boxes',
    category: 'Packaging',
    unit: 'units',
    current_stock: 85,
    min_threshold: 150,
    cost_per_unit: 7.5,
    supplier: 'EcoPack India Ltd',
    last_restocked: '2026-09-20',
    linked_dishes: ['All Delivery & Takeaway Burgers']
  },
  {
    id: 11,
    name: 'Thermal Paper Receipt Rolls (80mm)',
    category: 'Packaging',
    unit: 'rolls',
    current_stock: 9,
    min_threshold: 10,
    cost_per_unit: 45,
    supplier: 'POS Supplies Bangalore',
    last_restocked: '2026-09-28',
    linked_dishes: ['Billing Counter']
  },
  {
    id: 12,
    name: 'Arabian Shawarma Marinade',
    category: 'Spices & Sauces',
    unit: 'liters',
    current_stock: 4,
    min_threshold: 8,
    cost_per_unit: 260,
    supplier: 'Middle East Spices Blr',
    last_restocked: '2026-09-30',
    linked_dishes: ['Arabic Platter', 'Shawarma Roll']
  }
];

export const INVENTORY_CATEGORIES = [
  'All',
  'Bakery',
  'Meat & Poultry',
  'Dairy',
  'Frozen & Sides',
  'Spices & Sauces',
  'Packaging'
];
