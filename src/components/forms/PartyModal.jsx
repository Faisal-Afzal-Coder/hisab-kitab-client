import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const PartyModal = ({ isOpen, onClose, party = null, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('customer');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingBalanceType, setOpeningBalanceType] = useState('none');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (party) {
        setName(party.name || '');
        setPhone(party.phone || '');
        setEmail(party.email || '');
        setType(party.type || 'customer');
        setOpeningBalance(party.openingBalance || '');
        setOpeningBalanceType(party.openingBalanceType || 'none');
        setAddress(party.address || '');
        setCreditLimit(party.creditLimit || '');
        setNotes(party.notes || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setType('customer');
        setOpeningBalance('');
        setOpeningBalanceType('none');
        setAddress('');
        setCreditLimit('');
        setNotes('');
      }
    }
  }, [isOpen, party]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide party name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (party) {
        await api.put(`/parties/${party._id}`, {
          name,
          phone,
          email,
          type,
          address,
          creditLimit,
          notes,
        });
      } else {
        await api.post('/parties', {
          name,
          phone,
          email,
          type,
          openingBalance: Number(openingBalance) || 0,
          openingBalanceType,
          address,
          creditLimit: Number(creditLimit) || 0,
          notes,
        });
      }

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to save party');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={party ? `Edit Party: ${party.name}` : 'Add New Party (Customer / Supplier)'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Party Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Ali Traders or Bilal Supplier"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Party Type *</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="customer">Customer (Grahak)</option>
              <option value="supplier">Supplier (Vendor)</option>
              <option value="both">Both (Customer & Supplier)</option>
              <option value="partner">Partner</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phone / WhatsApp</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {!party && (
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Opening Balance (Pichla Baqaya):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Opening Amount (Rs.)</label>
                <input
                  type="number"
                  className="form-control amount-font"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="form-label">Balance Type</label>
                <select
                  className="form-select"
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value)}
                >
                  <option value="none">None (0 Balance)</option>
                  <option value="receivable">Lene Hain (Party Owes Us)</option>
                  <option value="payable">Dene Hain (We Owe Party)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Credit Limit (Rs.)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 500000"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            placeholder="Shop / Market / City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <input
            type="text"
            className="form-control"
            placeholder="Additional details or terms"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : party ? 'Update Party' : 'Create Party'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PartyModal;
