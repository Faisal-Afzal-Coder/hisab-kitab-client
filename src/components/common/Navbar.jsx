import React from 'react';
import {
  Sun,
  Moon,
  LogOut,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onOpenQuickAction, onToggleMobileSidebar }) => {
  const { user, business, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      {/* Left Mobile Menu Toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          className="btn btn-outline btn-icon mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Open Navigation Menu"
          style={{ width: '36px', height: '36px' }}
        >
          <Menu size={20} />
        </button>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, marginLeft: '0.35rem' }}>
            {business?.name || 'Hisab-Kitab'}
          </span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Quick Action Shortcuts (Desktop only) */}
        <div className="no-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-success btn-sm"
            onClick={() => onOpenQuickAction && onOpenQuickAction('receive')}
            title="Receive Customer Payment"
          >
            <ArrowDownLeft size={15} />
            <span>+ Wusool (In)</span>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onOpenQuickAction && onOpenQuickAction('pay')}
            title="Make Supplier Payment"
          >
            <ArrowUpRight size={15} />
            <span>- Ada (Out)</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onOpenQuickAction && onOpenQuickAction('sale')}
            title="New Sale Bill"
          >
            <ShoppingBag size={15} />
            <span>+ Sale Bill</span>
          </button>
        </div>

        {/* Logged in User Name Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.65rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: user?.avatarColor || 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.65rem',
            flexShrink: 0,
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={12} />}
          </span>
          <span className="no-mobile">{user?.name || 'User'}</span>
        </div>

        {/* Theme Mode Toggle */}
        <button
          className="btn btn-outline btn-icon btn-sm"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          style={{ width: '34px', height: '34px' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Logout */}
        <button
          className="btn btn-outline btn-icon btn-sm"
          onClick={logout}
          title="Logout"
          style={{ color: 'var(--danger)', width: '34px', height: '34px' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
