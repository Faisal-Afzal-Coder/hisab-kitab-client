import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Package,
  FileBarChart,
  History,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { business } = useBusiness();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ledger', label: 'Complete Hisab', icon: BookOpen },
    { to: '/receivables', label: 'Lene Hain (Receivables)', icon: ArrowDownLeft },
    { to: '/payables', label: 'Dene Hain (Payables)', icon: ArrowUpRight },
    { to: '/parties', label: 'Parties & Khata', icon: Users },
    { to: '/accounts', label: 'Cash & Bank Accounts', icon: Wallet },
    { to: '/income', label: 'Income / Received', icon: TrendingUp },
    { to: '/expenses', label: 'Expenses (Kharchay)', icon: Receipt },
    { to: '/sales', label: 'Sales & POS Bill', icon: ShoppingBag },
    { to: '/purchases', label: 'Purchases (Kharidari)', icon: ShoppingCart },
    { to: '/inventory', label: 'Inventory / Stock', icon: Package },
    { to: '/reports', label: 'Financial Reports', icon: FileBarChart },
    { to: '/activity', label: 'Activity Log', icon: History },
    { to: '/settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{
          padding: '1.15rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
              flexShrink: 0,
            }}>
              HK
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {business?.name || 'Hisab Kitab'}
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                Business Workspace
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            className="btn btn-outline btn-icon btn-sm mobile-menu-btn"
            onClick={onClose}
            title="Close menu"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Logged In User Info Box */}
        <div style={{
          margin: '0.85rem 1rem 0.4rem 1rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: user?.avatarColor || 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'owner' ? 'Owner / Admin' : 'Member'}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.6rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth <= 992 && onClose) onClose();
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
