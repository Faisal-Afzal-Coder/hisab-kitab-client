import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';

// Common Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import MobileNav from './components/common/MobileNav';

// Forms Modals
import QuickReceiveModal from './components/forms/QuickReceiveModal';
import QuickPayModal from './components/forms/QuickPayModal';
import SaleModal from './components/forms/SaleModal';
import TransactionModal from './components/forms/TransactionModal';

// Pages
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Receivables from './pages/Receivables';
import Payables from './pages/Payables';
import Parties from './pages/Parties';
import PartyDetail from './pages/PartyDetail';
import Accounts from './pages/Accounts';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Layout
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>Hisab-Kitab</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenQuickAction = (action) => {
    if (action === 'receive') setReceiveModalOpen(true);
    else if (action === 'pay') setPayModalOpen(true);
    else if (action === 'sale') setSaleModalOpen(true);
    else if (action === 'expense') setTxnModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          onOpenQuickAction={handleOpenQuickAction}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/receivables" element={<Receivables />} />
          <Route path="/payables" element={<Payables />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/parties/:id" element={<PartyDetail />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <MobileNav />

      {/* Global Quick Action Modals */}
      <QuickReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <QuickPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <TransactionModal
        isOpen={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        initialType="expense"
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
