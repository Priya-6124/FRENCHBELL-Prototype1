import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import QuickActionBar from './QuickActionBar';
import LiveOrderBoard from './LiveOrderBoard';
import TableQRManager from './TableQRManager';
import MenuManager from './MenuManager';
import OfferManager from './OfferManager';
import AdvertManager from './AdvertManager';
import CustomerManager from './CustomerManager';
import DeliverySettings from './DeliverySettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportModal from './ExportModal';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, Bell, Home } from 'lucide-react';

export default function AdminDashboard({ onBackToSite }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleQuickAction = (action) => {
    if (action.isModal && action.id === 'export-analytics') {
      setShowExportModal(true);
    } else if (action.tab) {
      setActiveTab(action.tab);
    }
  };

  return (
    <div className="min-h-screen bg-french-cream flex">
      
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToSite={onBackToSite}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Header Bar */}
        <header className="p-4 sm:p-6 bg-french-dark text-french-cream border-b border-french-gold/20 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-french-gold" />
            <div>
              <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-french-gold uppercase tracking-wide">
                FRENCH BELL CAFE OPERATIONS
              </h1>
              <p className="text-xs text-french-cream/80 font-medium">
                Logistics & Store Management • K. Narayanpura, Bengaluru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-french-gold bg-french-brown/80 px-3 py-1.5 rounded-full border border-french-gold/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store Live & Open</span>
            </div>

            <button
              onClick={onBackToSite}
              className="px-4 py-2 rounded-full bg-french-gold text-french-dark font-extrabold text-xs uppercase tracking-wider hover:bg-french-gold-hover transition-all flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Customer View</span>
            </button>
          </div>
        </header>

        {/* Tab Content Wrapper */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          
          {/* Quick Action Bar */}
          <QuickActionBar onAction={handleQuickAction} />

          {/* Render Active View */}
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'live-orders' && <LiveOrderBoard />}
          {activeTab === 'table-qr' && <TableQRManager />}
          {activeTab === 'menu-manager' && <MenuManager />}
          {activeTab === 'offers-manager' && <OfferManager />}
          {activeTab === 'adverts-manager' && <AdvertManager />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'settings' && <DeliverySettings />}
        </main>

      </div>

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
}
