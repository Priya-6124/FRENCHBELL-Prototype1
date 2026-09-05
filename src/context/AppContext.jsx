import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/menuData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation View: 'home' | 'menu'
  const [currentView, setCurrentView] = useState('home');

  // Order Mode: 'takeaway' | 'dine-in' | 'delivery' (Persisted in localStorage)
  const [orderMode, setOrderMode] = useState(() => {
    return localStorage.getItem('fb_order_mode') || 'takeaway';
  });
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

  // Cart State (Persisted in localStorage - Requirement 48)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Modals & Active Panes
  const [activeModal, setActiveModal] = useState(null); // 'dine-in', 'takeaway', 'delivery', 'foodDetails', 'checkout', 'confirmation', 'tracker', 'receipt', 'auth', 'profile'
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Menu & Live Settings
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [offers, setOffers] = useState([
    { id: 1, coupon_code: 'WELCOME50', title: 'Welcome Feast', description: '50% off up to ₹100 on your first delicious order', discount_type: 'percentage', discount_value: 50, minimum_order: 299, max_discount: 100, expiry_date: '30 Sep 2026', applicable_order_type: 'all', active: 1 },
    { id: 2, coupon_code: 'BELL50', title: 'Flat ₹50 Off Special', description: 'Flat ₹50 off on minimum order of ₹250', discount_type: 'fixed', discount_value: 50, minimum_order: 250, expiry_date: '31 Oct 2026', applicable_order_type: 'all', active: 1 },
    { id: 3, coupon_code: 'DING10', title: '10% Off Cafe Cravings', description: 'Get 10% off on all orders above ₹199', discount_type: 'percentage', discount_value: 10, minimum_order: 199, max_discount: 60, expiry_date: '15 Oct 2026', applicable_order_type: 'all', active: 1 }
  ]);
  const [advertisements, setAdvertisements] = useState([
    { id: 1, type: 'Weekend Offer', title: 'Monster Crispy Burgers & Sizzling Momos', description: 'Handcrafted fresh with secret French spices and gooey molten cheese!', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', cta: 'Explore Menu', active: 1 },
    { id: 2, type: 'Combo Offer', title: 'Grand Cafe Platters for Sharing', description: 'Loaded sampler plates with fries, strips, momos and dips starting at ₹179!', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', cta: 'View Platters', active: 1 },
    { id: 3, type: 'Special Discount', title: 'Free 20-Min Doorstep Delivery', description: 'Enjoy piping hot gourmet snacks delivered right to your door with zero delivery fees!', image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80', cta: 'Order Now', active: 1 }
  ]);

  const [settings, setSettings] = useState({
    cafe_name: 'FrenchBell Cafe',
    cafe_address: 'K. Narayanpura, Bengaluru – 560077, Karnataka',
    cafe_phone: '+91 98765 43210',
    cafe_email: 'hello@frenchbellcafe.com',
    cafe_hours: '11:00 AM – 11:30 PM',
    free_delivery_km: '2',
    delivery_fee_per_km: '15',
    min_order_delivery: '120',
    dine_in_enabled: '1',
    takeaway_enabled: '1',
    delivery_enabled: '1',
    tax_rate_percent: '5',
    about_image_url: '/assets/logo.jfif',
    aboutImage: '/assets/logo.jfif',
    instagram_url: 'https://instagram.com/frenchbellcafe',
    whatsapp_number: '+919876543210',
    facebook_url: 'https://facebook.com/frenchbellcafe',
    map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.5862211993245!2d77.6434587!3d13.0619938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae196f7c9e0b1f%3A0x4a01c79e72809f6e!2sK%20Narayanpura%20Main%20Rd%2C%20Bengaluru%2C%20Karnataka%20560077!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
  });

  // Coupons State
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [userManuallySelectedCoupon, setUserManuallySelectedCoupon] = useState(false);
  const [isAutoCoupon, setIsAutoCoupon] = useState(false);

  // Toasts (No Emojis)
  const [notifications, setNotifications] = useState([]);

  // Save cart & orderMode to localStorage
  useEffect(() => {
    localStorage.setItem('fb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fb_order_mode', orderMode);
  }, [orderMode]);

  // Check URL params on initial load for QR Table Dine-In Scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    const modeParam = params.get('mode');

    if (tableParam) {
      setLockedTableNumber(tableParam);
      setOrderMode('dine-in');
      setDineInDetails(prev => ({ ...prev, tableNumber: tableParam }));
      addNotification(`Dine-In Table #${tableParam}`, 'Welcome to FrenchBell Cafe! You are ordering for Table #' + tableParam, 'success');
    } else if (modeParam && ['dine-in', 'takeaway', 'delivery'].includes(modeParam)) {
      setOrderMode(modeParam);
    }
  }, []);

  // Fetch initial data from server
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

  // Notification helper (Zero emojis)
  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Subtotal Calculation
  const cartSubtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const totalItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  // Helper to compute discount for a coupon
  const computeDiscount = (coupon, subtotal) => {
    if (!coupon || subtotal < (coupon.minimum_order || 0)) return 0;
    if (coupon.discount_type === 'percentage') {
      let disc = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount) disc = Math.min(disc, coupon.max_discount);
      return disc;
    }
    return Number(coupon.discount_value || 0);
  };

  // Requirement 26: Automatic Best Coupon Application
  useEffect(() => {
    if (cartSubtotal <= 0) {
      if (appliedOffer && isAutoCoupon) {
        setAppliedOffer(null);
      }
      return;
    }

    // If user manually chose a coupon and it still meets min order, keep it
    if (userManuallySelectedCoupon && appliedOffer) {
      if (cartSubtotal >= (appliedOffer.minimum_order || 0)) {
        return;
      }
    }

    // Find all qualifying active coupons matching current orderMode
    const eligible = (offers || []).filter(o => {
      if (o.active === 0 || !o.coupon_code) return false;
      if (o.applicable_order_type && o.applicable_order_type !== 'all' && o.applicable_order_type !== orderMode) return false;
      if (cartSubtotal < (o.minimum_order || 0)) return false;
      return true;
    });

    if (eligible.length > 0) {
      // Pick the coupon that gives maximum savings
      let best = eligible[0];
      let maxDiscount = computeDiscount(best, cartSubtotal);

      for (const coupon of eligible) {
        const d = computeDiscount(coupon, cartSubtotal);
        if (d > maxDiscount) {
          maxDiscount = d;
          best = coupon;
        }
      }

      setAppliedOffer(best);
      setIsAutoCoupon(true);
    } else if (isAutoCoupon) {
      setAppliedOffer(null);
    }
  }, [cartSubtotal, orderMode, offers]);

  // Cart Functions
  const addToCart = (item, qty = 1, options = {}) => {
    const { variant = null, specialInstructions = '' } = options;

    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 400);

    let unitPrice = item.price;
    if (variant === 'Veg' && item.price_veg) unitPrice = item.price_veg;
    if (variant === 'Chicken' && item.price_chicken) unitPrice = item.price_chicken;

    // Unique key combines item id, variant, and instructions
    const cartItemId = `${item.id}-${variant || 'std'}-${specialInstructions.slice(0, 20)}`;

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
          specialInstructions,
          price: unitPrice,
          quantity: qty,
          image_url: item.image_url,
          category_slug: item.category_slug || item.category_name,
          veg_type: variant ? (variant === 'Veg' ? 'veg' : 'non-veg') : item.veg_type
        }];
      }
    });

    addNotification('Added to Cart', `${qty}x ${item.name}${variant ? ` (${variant})` : ''}`, 'success');
  };

  // Requirement 24: Update existing cart item (Customization & Quantity)
  const updateCartItemDetails = (cartItemId, updates) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          ...updates
        };
      }
      return item;
    }));
    addNotification('Cart Updated', 'Your changes have been saved to your cart.', 'success');
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
    setUserManuallySelectedCoupon(false);
    setIsAutoCoupon(false);
  };

  // Discount Amount
  let discountAmount = computeDiscount(appliedOffer, cartSubtotal);

  // Tax calculation (5% GST)
  const taxRate = Number(settings.tax_rate_percent || 5) / 100;
  const taxAmount = Math.round(Math.max(0, cartSubtotal - discountAmount) * taxRate);

  // Delivery charge calculation (₹25 only if delivery and subtotal under ₹199)
  const deliveryCharge = orderMode === 'delivery' ? (cartSubtotal > 0 && cartSubtotal < 199 ? 25 : 0) : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + taxAmount + deliveryCharge);

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      orderMode, setOrderMode,
      lockedTableNumber, setLockedTableNumber,
      dietaryFilter, setDietaryFilter,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      dineInDetails, setDineInDetails,
      takeawayDetails, setTakeawayDetails,
      deliveryDetails, setDeliveryDetails,
      cart, cartOpen, setCartOpen, cartAnimate,
      addToCart, updateCartItemDetails, removeFromCart, updateCartQty, clearCart,
      cartSubtotal, discountAmount, taxAmount, deliveryCharge, grandTotal, totalItemCount,
      appliedOffer, setAppliedOffer, setUserManuallySelectedCoupon, isAutoCoupon,
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
