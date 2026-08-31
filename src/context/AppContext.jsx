import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/menuData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Order Mode: 'dine-in' | 'takeaway' | 'delivery'
  const [orderMode, setOrderMode] = useState('delivery');
  const [lockedTableNumber, setLockedTableNumber] = useState(null); // When scanned from QR

  // Dietary Filter: 'all' | 'veg' | 'non-veg'
  const [dietaryFilter, setDietaryFilter] = useState('all');

  // Active Category Selection
  const [activeCategory, setActiveCategory] = useState('all');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Order Details Forms
  const [dineInDetails, setDineInDetails] = useState({ tableNumber: '04', numPeople: 2, customerName: '', instructions: '' });
  const [takeawayDetails, setTakeawayDetails] = useState({ customerName: '', phone: '', pickupTime: '20-30 mins', instructions: '' });
  const [deliveryDetails, setDeliveryDetails] = useState({ customerName: '', phone: '', address: 'K. Narayanpura, Main Rd', landmark: 'Near SBI ATM', pincode: '560077', instructions: '' });

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Modals & Active Panes
  const [activeModal, setActiveModal] = useState(null); // 'dine-in', 'takeaway', 'delivery', 'foodDetails', 'checkout', 'confirmation', 'tracker', 'receipt', 'auth', 'profile'
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Menu & Settings
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [offers, setOffers] = useState([
    { id: 1, coupon_code: 'FRENCHBELL20', title: '20% Off Weekend Special', description: 'Get 20% flat discount on all food items above ₹199', discount_type: 'percentage', discount_value: 20, minimum_order: 199, active: 1 },
    { id: 2, coupon_code: 'BELL50', title: 'Flat ₹50 Off Welcome Treat', description: 'Flat ₹50 off on minimum order of ₹250', discount_type: 'flat', discount_value: 50, minimum_order: 250, active: 1 },
    { id: 3, coupon_code: 'MOMOFUN', title: '15% Off Momos & Strips', description: 'Enjoy 15% discount on delicious momos and crispy strips', discount_type: 'percentage', discount_value: 15, minimum_order: 150, active: 1 }
  ]);
  const [advertisements, setAdvertisements] = useState([
    { id: 1, title: '🔥 Monster Crispy Burgers & Sizzling Momos', description: 'Handcrafted fresh with secret French spices and gooey molten cheese!', image_url: '/assets/food/burger.jpg', cta: 'Order Now', active: 1 },
    { id: 2, title: '🍱 Grand Cafe Platters for Sharing', description: 'Loaded sampler plates with fries, strips, momos and dips starting at ₹179!', image_url: '/assets/food/platter.jpg', cta: 'Explore Platters', active: 1 },
    { id: 3, title: '🛵 Free 20-Min Doorstep Delivery', description: 'Enjoy piping hot gourmet snacks delivered right to your door with zero delivery fees!', image_url: '/assets/food/strips.jpg', cta: 'Order Delivery', active: 1 }
  ]);

  const [settings, setSettings] = useState({
    cafe_name: 'French Bell Cafe',
    cafe_address: 'K. Narayanpura, Bengaluru – 560077, Karnataka',
    cafe_phone: '+91 98765 43210',
    cafe_email: 'hello@frenchbellcafe.com',
    free_delivery_km: '2',
    delivery_fee_per_km: '15',
    min_order_delivery: '120',
    dine_in_enabled: '1',
    takeaway_enabled: '1',
    delivery_enabled: '1',
    tax_rate_percent: '5',
    order_reset_time: '02:00'
  });

  // Coupons
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Toasts
  const [notifications, setNotifications] = useState([]);

  // Check URL params on initial load for QR Table Dine-In Scan (e.g. ?table=4 or ?mode=dine-in&table=4)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    const modeParam = params.get('mode');

    if (tableParam) {
      setLockedTableNumber(tableParam);
      setOrderMode('dine-in');
      setDineInDetails(prev => ({ ...prev, tableNumber: tableParam }));
      addNotification(`🍽️ Dine-In at Table #${tableParam}`, 'Welcome to French Bell Cafe! You are ordering directly for Table #' + tableParam, 'success');
    } else if (modeParam && ['dine-in', 'takeaway', 'delivery'].includes(modeParam)) {
      setOrderMode(modeParam);
    }
  }, []);

  // Fetch initial data from server if backend is live
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setMenuItems(data); })
      .catch(() => {});

    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setCategories(data); })
      .catch(() => {});

    fetch('/api/offers')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setOffers(data); })
      .catch(() => {});

    fetch('/api/advertisements')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.length) setAdvertisements(data); })
      .catch(() => {});

    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSettings(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  // Notification helper
  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Cart Functions (NO sound here - only splash and payment success)
  const addToCart = (item, qty = 1, options = {}) => {
    const { variant = null, size = 'Regular', spiceLevel = 'Medium', selectedAddons = [], specialInstructions = '' } = options;

    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 400);

    const addonsCost = (selectedAddons || []).reduce((sum, a) => sum + (a.price || 0), 0);
    const sizeMultiplier = size === 'Jumbo' ? 1.4 : (size === 'Large' ? 1.2 : 1);
    
    let baseItemPrice = item.price;
    if (variant === 'Veg' && item.price_veg) baseItemPrice = item.price_veg;
    if (variant === 'Chicken' && item.price_chicken) baseItemPrice = item.price_chicken;

    const unitPrice = Math.round(baseItemPrice * sizeMultiplier) + addonsCost;
    const addonsKey = (selectedAddons || []).map(a => a.name).sort().join('-');
    const cartItemId = `${item.id}-${variant || 'std'}-${size}-${spiceLevel}-${addonsKey}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + qty } : i);
      } else {
        return [...prev, {
          cartItemId,
          id: item.id,
          name: item.name,
          variant,
          size,
          spiceLevel,
          selectedAddons,
          specialInstructions,
          price: unitPrice,
          quantity: qty,
          image_url: item.image_url,
          category_slug: item.category_slug || item.category_name,
          veg_type: variant ? (variant === 'Veg' ? 'veg' : 'non-veg') : item.veg_type
        }];
      }
    });

    addNotification('Added to Cart 🛍️', `${qty}x ${item.name} (${size}${variant ? ` - ${variant}` : ''})`, 'success');
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartItemId === cartItemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedOffer(null);
  };

  // Subtotal & Calculations
  const cartSubtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const totalItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  let discountAmount = 0;
  if (appliedOffer) {
    if (appliedOffer.discount_type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedOffer.discount_value) / 100);
    } else {
      discountAmount = appliedOffer.discount_value;
    }
  }

  // Tax calculation (e.g. 5% GST)
  const taxRate = Number(settings.tax_rate_percent || 5) / 100;
  const taxAmount = Math.round(Math.max(0, cartSubtotal - discountAmount) * taxRate);

  // Delivery charge calculation (Free above min_order or within 2km)
  const deliveryCharge = orderMode === 'delivery' ? (cartSubtotal > 0 && cartSubtotal < 199 ? 25 : 0) : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + taxAmount + deliveryCharge);

  return (
    <AppContext.Provider value={{
      orderMode, setOrderMode,
      lockedTableNumber, setLockedTableNumber,
      dietaryFilter, setDietaryFilter,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      dineInDetails, setDineInDetails,
      takeawayDetails, setTakeawayDetails,
      deliveryDetails, setDeliveryDetails,
      cart, cartOpen, setCartOpen, cartAnimate,
      addToCart, removeFromCart, updateCartQty, clearCart,
      cartSubtotal, discountAmount, taxAmount, deliveryCharge, grandTotal, totalItemCount,
      appliedOffer, setAppliedOffer,
      activeModal, setActiveModal,
      selectedFood, setSelectedFood,
      activeOrder, setActiveOrder,
      menuItems, setMenuItems,
      categories, setCategories,
      offers, setOffers,
      advertisements, setAdvertisements,
      settings, setSettings,
      notifications, addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
