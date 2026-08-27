import React from 'react';
import { Calendar } from 'lucide-react';

const DateFilter = ({
  selectedPreset,
  onPresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const presets = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="date-filter-bar" style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.5rem',
      margin: '1rem 0',
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
        <Calendar size={15} />
        <span>Date:</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {presets.map((p) => {
          const isActive = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPresetChange(p.id)}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.775rem',
                fontWeight: isActive ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {selectedPreset === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <input
            type="date"
            className="form-control"
            style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem', width: 'auto' }}
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-control"
            style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem', width: 'auto' }}
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default DateFilter;
