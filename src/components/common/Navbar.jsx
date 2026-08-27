import React, { useState } from 'react';
import {
  Sun,
  Moon,
  LogOut,
  UserCheck,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onOpenQuickAction, onToggleMobileSidebar }) => {
  const { user, logout, switchBrother } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showBrotherMenu, setShowBrotherMenu] = useState(false);

  const handleSwitchBrother = async (index) => {
    try {
      await switchBrother(index);
      setShowBrotherMenu(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch brother:', err);
    }
  };

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
            Joint Brothers Ledger
          </span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Quick Action Shortcuts (Desktop only to prevent clutter) */}
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

        {/* 1-Click Brother Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowBrotherMenu(!showBrotherMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: 'var(--primary)',
              padding: '0.35rem 0.6rem',
            }}
          >
            <UserCheck size={15} color={user?.avatarColor || 'var(--primary)'} />
            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
              B{user?.brotherIndex || 1}
            </span>
          </button>

          {showBrotherMenu && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: '230px',
                zIndex: 1000,
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Switch Active Brother:
              </div>

              {[1, 2, 3].map((bNum) => {
                const brotherColors = ['#10b981', '#3b82f6', '#8b5cf6'];
                const brotherNames = ['Brother 1', 'Brother 2', 'Brother 3'];
                const isCurrent = user?.brotherIndex === bNum;

                return (
                  <button
                    key={bNum}
                    onClick={() => handleSwitchBrother(bNum)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      border: isCurrent ? '1px solid var(--primary)' : '1px solid transparent',
                      backgroundColor: isCurrent ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: brotherColors[bNum - 1],
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {bNum}
                    </span>
                    <span>{brotherNames[bNum - 1]}</span>
                  </button>
                );
              })}
            </div>
          )}
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
