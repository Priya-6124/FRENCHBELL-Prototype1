import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Utensils, Users, Tag, Megaphone,
  Bike, CreditCard, Receipt, BarChart3, Bell, Settings,
  ArrowLeft, ChevronDown, ChevronRight, ChevronLeft,
  X, QrCode, LogOut, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onBackToSite,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { menuItems } = useApp();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Expanded sub-menus tracking
  const [expandedSections, setExpandedSections] = useState({
    orders: true,
    menu: false,
    customers: false,
    offers: false,
    ads: false,
    'dine-in': false,
    delivery: false,
    analytics: false,
    settings: false,
  });

  // Calculate badges
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Poll for counts
  useEffect(() => {
    if (Array.isArray(menuItems)) {
      const outCount = menuItems.filter(i => (i.available === 0 || (i.stock_quantity !== undefined && i.stock_quantity <= 0))).length;
      setOutOfStockCount(outCount);
    }

    const fetchStats = async () => {
      try {
        const resOrders = await fetch('/api/orders');
        if (resOrders.ok) {
          const orders = await resOrders.json();
          if (Array.isArray(orders)) {
            const newCount = orders.filter(o => o.order_status === 'received' || o.order_status === 'new').length;
            setNewOrdersCount(newCount);
          }
        }
      } catch (e) {}

      try {
        const resNotifs = await fetch('/api/admin/notifications');
        if (resNotifs.ok) {
          const notifs = await resNotifs.json();
          setUnreadNotifications(notifs.unread_count || 0);
        }
      } catch (e) {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [menuItems]);

  const toggleSection = (key) => {
    if (collapsed) setCollapsed(false);
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Nav structure (no Dine-In, no Admin Profile, no Logout)
  const navItems = [
    {
      type: 'single',
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      type: 'group',
      key: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? `${newOrdersCount}` : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
      children: [
        { id: 'orders', label: 'All Orders' },
        { id: 'orders-new', label: 'New', badge: newOrdersCount > 0 ? `${newOrdersCount}` : null },
        { id: 'orders-preparing', label: 'Preparing' },
        { id: 'orders-ready', label: 'Ready' },
        { id: 'orders-out_for_delivery', label: 'Out for Delivery' },
        { id: 'orders-completed', label: 'Completed' },
        { id: 'orders-cancelled', label: 'Cancelled' },
      ]
    },
    {
      type: 'group',
      key: 'menu',
      label: 'Menu',
      icon: Utensils,
      badge: outOfStockCount > 0 ? `${outOfStockCount} Out` : null,
      badgeColor: 'bg-amber-600/30 text-amber-300 border border-amber-500/40',
      children: [
        { id: 'menu-items', label: 'Menu Items' },
        { id: 'menu-categories', label: 'Categories' },
        { id: 'menu-availability', label: 'Availability', badge: outOfStockCount > 0 ? `${outOfStockCount}` : null },
      ]
    },
    {
      type: 'group',
      key: 'customers',
      label: 'Customers',
      icon: Users,
      children: [
        { id: 'customers', label: 'All Customers' },
        { id: 'customers-orders', label: 'Customer Orders' },
      ]
    },
    {
      type: 'group',
      key: 'offers',
      label: 'Offers & Coupons',
      icon: Tag,
      children: [
        { id: 'offers-coupons', label: 'Coupons' },
        { id: 'offers-promotions', label: 'Promotions' },
      ]
    },
    {
      type: 'group',
      key: 'ads',
      label: 'Advertisements',
      icon: Megaphone,
      children: [
        { id: 'ads-active', label: 'Active' },
        { id: 'ads-scheduled', label: 'Scheduled' },
        { id: 'ads-add', label: 'Add Advertisement' },
      ]
    },
    {
      type: 'group',
      key: 'dine-in',
      label: 'Dine-In',
      icon: QrCode,
      children: [
        { id: 'dine-in-tables', label: 'Tables' },
        { id: 'dine-in-qr', label: 'QR Codes' },
        { id: 'dine-in-orders', label: 'Dine-In Orders' },
      ]
    },
    {
      type: 'group',
      key: 'delivery',
      label: 'Delivery',
      icon: Bike,
      children: [
        { id: 'delivery-orders', label: 'Orders' },
        { id: 'delivery-area', label: 'Delivery Area' },
        { id: 'delivery-settings', label: 'Delivery Settings' },
      ]
    },
    {
      type: 'single',
      id: 'payments',
      label: 'Transactions',
      icon: CreditCard,
    },
    {
      type: 'single',
      id: 'receipts',
      label: 'Receipts',
      icon: Receipt,
    },
    {
      type: 'group',
      key: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      children: [
        { id: 'analytics-sales', label: 'Sales' },
        { id: 'analytics-orders', label: 'Orders' },
        { id: 'analytics-customers', label: 'Customers' },
        { id: 'analytics-products', label: 'Products' },
        { id: 'analytics-export', label: 'Export Reports' },
      ]
    },
    {
      type: 'single',
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? `${unreadNotifications}` : null,
      badgeColor: 'bg-red-600 text-white',
    },
    {
      type: 'group',
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        { id: 'settings-cafe', label: 'Cafe Information' },
        { id: 'settings-hours', label: 'Business Hours' },
        { id: 'settings-orders', label: 'Order Settings' },
        { id: 'settings-delivery', label: 'Delivery Settings' },
        { id: 'settings-payment', label: 'Payment Settings' },
        { id: 'settings-admins', label: 'Admin Users' },
        { id: 'settings-logs', label: 'Activity Logs' },
      ]
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header & Logo */}
      <div>
        <div className="p-4 border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-french-gold p-0.5 bg-french-dark gold-glow shrink-0">
              <img src="/assets/logo.jfif" alt="FrenchBell" className="w-full h-full object-contain rounded-full" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h2 className="font-serif font-black text-sm text-french-cream tracking-wide truncate">
                  FRENCHBELL CAFE
                </h2>
                <span className="text-[9px] uppercase font-black text-french-gold tracking-widest block truncate">
                  ADMIN PANEL
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-french-gold/70 hover:text-french-gold hover:bg-french-brown/60 transition-all shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-french-cream/60 hover:text-french-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'single') {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark shadow-md gold-glow font-black'
                      : 'text-french-cream/80 hover:bg-french-brown/60 hover:text-french-gold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-french-dark' : 'text-french-gold'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${item.badgeColor || 'bg-french-gold/20 text-french-gold'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            // Group with children
            const isGroupActive = item.children.some(c => c.id === activeTab);
            const isExpanded = expandedSections[item.key];

            return (
              <div key={item.key} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isGroupActive
                      ? 'bg-french-brown/70 text-french-gold border border-french-gold/20'
                      : 'text-french-cream/80 hover:bg-french-brown/50 hover:text-french-gold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 text-french-gold shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0 ${item.badgeColor || 'bg-french-gold/20 text-french-gold'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-french-cream/50" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-french-cream/50" />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu Accordion */}
                {!collapsed && isExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-french-gold/20 ml-4 my-0.5">
                    {item.children.map(child => {
                      const isChildSelected = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleSelectTab(child.id)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all text-left flex items-center justify-between ${
                            isChildSelected
                              ? 'bg-french-gold text-french-dark font-black shadow-sm'
                              : 'text-french-cream/70 hover:text-french-gold hover:bg-french-brown/40'
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                          {child.badge && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-600 text-white shrink-0">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer – Back to Website Only */}
      <div className="p-3 border-t border-french-gold/20 bg-french-dark/95">
        <button
          onClick={onBackToSite}
          title={collapsed ? "Switch to Customer Website" : undefined}
          className={`w-full py-2 px-3 rounded-xl bg-french-brown/90 border border-french-gold/30 text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center ${
            collapsed ? 'justify-center' : 'justify-center gap-2'
          }`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Customer Website</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-french-dark border-r border-french-gold/20 h-screen sticky top-0 shadow-2xl transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-72 bg-french-dark border-r border-french-gold/20 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
