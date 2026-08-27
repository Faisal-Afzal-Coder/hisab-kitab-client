import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
} from 'lucide-react';

const MobileNav = () => {
  const items = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/ledger', label: 'Hisab', icon: BookOpen },
    { to: '/receivables', label: 'Lene Hain', icon: ArrowDownLeft },
    { to: '/payables', label: 'Dene Hain', icon: ArrowUpRight },
    { to: '/inventory', label: 'Stock', icon: Package },
  ];

  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.675rem',
              fontWeight: isActive ? 700 : 500,
              gap: '3px',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
