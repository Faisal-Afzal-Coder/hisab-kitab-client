import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, DollarSign, Save, Trash2, AlertTriangle } from 'lucide-react';
import Modal from '../components/common/Modal';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { business, setBusiness, triggerRefresh } = useBusiness();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('Rs.');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [footerMsg, setFooterMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Clear data state
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setCurrency(business.currency || 'Rs.');
      setPhone(business.phone || '');
      setAddress(business.address || '');
      setTaxNumber(business.taxNumber || '');
      setFooterMsg(business.settings?.receiptFooterMessage || 'Thank you for your business!');
    }
  }, [business]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/business', {
        name,
        currency,
        phone,
        address,
        taxNumber,
        settings: {
          receiptFooterMessage: footerMsg,
        },
      });

      if (setBusiness) setBusiness(res.data.business);
      setSuccess('Business settings updated successfully!');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleClearData = async () => {
    setClearLoading(true);
    try {
      await api.post('/business/clear-data');
      setClearLoading(false);
      setClearModalOpen(false);
      triggerRefresh();
      window.location.reload();
    } catch (err) {
      setClearLoading(false);
      alert(err.response?.data?.message || 'Failed to clear data');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <SettingsIcon size={26} color="var(--primary)" /> Business Settings & Workspace
          </h1>
          <div className="page-subtitle">
            Configure business identity, currency symbol, tax registration, and invoice branding
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '750px' }}>
        {/* Business Profile Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Business Profile</h3>
          <form onSubmit={handleSubmit}>
            {success && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Business / Firm Name *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Khan Brothers Joint Trading"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Rs. or PKR or $"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Phone / WhatsApp</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Tax NTN / Registration #</label>
                <input
                  type="text"
                  className="form-control"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="e.g. NTN-7894561-2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fiscal Year</label>
                <input
                  type="text"
                  className="form-control"
                  value="July - June"
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Shop / Warehouse Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Commercial Market, Block B"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bill / Invoice Receipt Footer Note</label>
              <input
                type="text"
                className="form-control"
                value={footerMsg}
                onChange={(e) => setFooterMsg(e.target.value)}
                placeholder="Thank you for your business with us!"
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Clear Data / Reset Database Card */}
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.5rem' }}>
            <Trash2 size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Clear All Business Data (Reset Database)</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Use this option if you want to wipe all transactions, sales, purchases, customer/supplier parties, products, and expenses to start with a completely empty slate for your own real business data.
          </p>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setClearModalOpen(true)}
          >
            <Trash2 size={15} /> Clear All Data & Start Fresh
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {clearModalOpen && (
        <Modal isOpen={clearModalOpen} onClose={() => setClearModalOpen(false)} title="Confirm Database Reset">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Warning:</strong> This will delete all parties, products, transactions, invoices, and expenses. You will have a 100% clean database to enter all your real records manually from scratch.
              </div>
            </div>

            <div style={{ fontSize: '0.9rem' }}>
              Are you sure you want to wipe all records and start fresh?
            </div>

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setClearModalOpen(false)} disabled={clearLoading}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleClearData} disabled={clearLoading}>
                {clearLoading ? 'Wiping Data...' : 'Yes, Clear All Data'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;
