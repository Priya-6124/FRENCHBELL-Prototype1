import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/menuData';
import { playBellDing } from '../utils/audio';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Order Mode
  const [orderMode, setOrderMode] = useState('delivery'); // 'dine-in', 'takeaway', 'delivery'

  // Order Details Forms
  const [dineInDetails, setDineInDetails] = useState({ tableNumber: '04', numPeople: 2, customerName: '', instructions: '' });
  const [takeawayDetails, setTakeawayDetails] = useState({ customerName: '', phone: '', pickupTime: '20-30 mins', instructions: '' });
  const [deliveryDetails, setDeliveryDetails] = useState({ customerName: '', phone: '', address: 'K. Narayanpura, Main Rd', landmark: 'Near SBI ATM', pincode: '560077', instructions: '' });

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Modals & Active Panes
  const [activeModal, setActiveModal] = useState(null); // 'orderMode', 'foodDetails', 'checkout', 'tracker', 'receipt', 'auth'
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Menu & Settings
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState({
    free_delivery_km: '2',
    delivery_fee_per_km: '15',
    min_order_delivery: '120',
    dine_in_enabled: '1',
    takeaway_enabled: '1',
    delivery_enabled: '1'
  });

  // Coupons
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Toasts
  const [notifications, setNotifications] = useState([]);

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
    }, 4000);
  };

  // Cart Functions
  const addToCart = (item, qty = 1, variant = null) => {
    playBellDing();
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 500);

    const price = variant === 'Veg' && item.price_veg ? item.price_veg : (variant === 'Chicken' && item.price_chicken ? item.price_chicken : item.price);
    const cartItemId = `${item.id}-${variant || 'standard'}`;

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
          price,
          quantity: qty,
          image_url: item.image_url,
          category_slug: item.category_slug || item.category_name,
          veg_type: variant ? (variant === 'Veg' ? 'veg' : 'non-veg') : item.veg_type
        }];
      }
    });

    addNotification('Added to Cart 🔔', `${qty}x ${item.name} ${variant ? `(${variant})` : ''} added!`, 'success');
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
      discountAmount = (cartSubtotal * appliedOffer.discount_value) / 100;
    } else {
      discountAmount = appliedOffer.discount_value;
    }
  }

  // Delivery charge calculation
  const deliveryCharge = orderMode === 'delivery' ? (cartSubtotal > 0 ? 0 : 0) : 0; // Free within 2km banner!
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + deliveryCharge);

  return (
    <AppContext.Provider value={{
      orderMode, setOrderMode,
      dineInDetails, setDineInDetails,
      takeawayDetails, setTakeawayDetails,
      deliveryDetails, setDeliveryDetails,
      cart, cartOpen, setCartOpen, cartAnimate,
      addToCart, removeFromCart, updateCartQty, clearCart,
      cartSubtotal, discountAmount, deliveryCharge, grandTotal, totalItemCount,
      appliedOffer, setAppliedOffer,
      activeModal, setActiveModal,
      selectedFood, setSelectedFood,
      activeOrder, setActiveOrder,
      menuItems, setMenuItems,
      categories, setCategories,
      settings, setSettings,
      notifications, addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
