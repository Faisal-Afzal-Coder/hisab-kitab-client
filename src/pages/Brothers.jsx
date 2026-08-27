import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, CheckCircle, RefreshCw, Smartphone, Mail } from 'lucide-react';
import BrotherBadge from '../components/common/BrotherBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Brothers = () => {
  const { user, switchBrother } = useAuth();
  const [brothersList, setBrothersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrothers();
  }, []);

  const loadBrothers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/brothers');
      setBrothersList(res.data.brothers || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSwitch = async (brotherIndex) => {
    try {
      await switchBrother(brotherIndex);
      window.location.reload();
    } catch (err) {
      console.error('Error switching brother:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={26} color="var(--primary)" /> 3 Brothers Workspace Management
          </h1>
          <div className="page-subtitle">
            Joint partnership profiles, access roles, and quick account switcher
          </div>
        </div>
      </div>

      {/* 3 Brothers Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3].map((bNum) => {
          const brotherData = brothersList.find((b) => b.brotherIndex === bNum) || {
            name: bNum === 1 ? 'Ahmed Khan (Brother 1)' : bNum === 2 ? 'Bilal Khan (Brother 2)' : 'Hamza Khan (Brother 3)',
            email: `brother${bNum}@khanbrothers.com`,
            role: bNum === 1 ? 'owner' : 'admin',
            brotherIndex: bNum,
            avatarColor: bNum === 1 ? '#10b981' : bNum === 2 ? '#3b82f6' : '#8b5cf6',
          };

          const isCurrentActive = user?.brotherIndex === bNum;

          return (
            <div
              key={bNum}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isCurrentActive ? `2px solid ${brotherData.avatarColor}` : '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isCurrentActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: brotherData.avatarColor,
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderBottomLeftRadius: '8px',
                  textTransform: 'uppercase',
                }}>
                  Active User
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: brotherData.avatarColor,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                    }}
                  >
                    B{bNum}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{brotherData.name}</h3>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase', marginTop: '2px' }}>
                      {brotherData.role === 'owner' ? 'Managing Partner (Owner)' : 'Operating Partner (Admin)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} /> {brotherData.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Smartphone size={14} /> {brotherData.phone || `0300-${bNum}${bNum}${bNum}${bNum}${bNum}${bNum}${bNum}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Full Joint Workspace Permissions
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                {isCurrentActive ? (
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled>
                    Currently Logged In
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => handleSwitch(bNum)}
                  >
                    <RefreshCw size={14} /> Switch to Brother {bNum} Account
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Collaboration Rules */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="var(--primary)" /> Multi-User Shared Workspace Rules
        </h3>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>All three brothers share the <strong>SAME business database</strong>, party khatas, accounts, and stock catalog.</li>
          <li>Every transaction created by Brother 1 is immediately reflected in the dashboards of Brother 2 and Brother 3.</li>
          <li>Every transaction permanently stores the exact brother who entered or approved it.</li>
          <li>Audit logs record all updates and payments with timestamps for 100% financial transparency.</li>
        </ul>
      </div>
    </div>
  );
};

export default Brothers;
