import React from 'react';
import { useBusiness } from '../../context/BusinessContext';

const StatCard = ({
  title,
  value,
  variant = 'default', // 'receivable', 'payable', 'success', 'warning', 'purple'
  icon: Icon,
  subtitle,
  isCurrency = true,
}) => {
  const { formatCurrency } = useBusiness();

  const getVariantStyles = () => {
    switch (variant) {
      case 'receivable':
        return {
          iconBg: 'rgba(59, 130, 246, 0.15)',
          iconColor: '#3b82f6',
        };
      case 'payable':
        return {
          iconBg: 'rgba(239, 68, 68, 0.15)',
          iconColor: '#ef4444',
        };
      case 'success':
        return {
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconColor: '#10b981',
        };
      case 'warning':
        return {
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#f59e0b',
        };
      case 'purple':
        return {
          iconBg: 'rgba(139, 92, 246, 0.15)',
          iconColor: '#8b5cf6',
        };
      default:
        return {
          iconBg: 'var(--bg-tertiary)',
          iconColor: 'var(--primary)',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`stat-card ${variant}`}>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">
          {isCurrency ? formatCurrency(value) : value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>

      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
