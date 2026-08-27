import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import BrotherBadge from '../common/BrotherBadge';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import api from '../../services/api';

const QuickReceiveModal = ({ isOpen, onClose, preselectedParty = null, onSuccess }) => {
  const { user } = useAuth();
  const { formatCurrency } = useBusiness();

  const [parties, setParties] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      loadData();
      if (preselectedParty) {
        setSelectedPartyId(preselectedParty._id || preselectedParty.id);
        setAmount(preselectedParty.remainingAmount || preselectedParty.currentBalance || '');
      } else {
        setSelectedPartyId('');
        setAmount('');
      }
      setReference('');
      setDescription('');
    }
  }, [isOpen, preselectedParty]);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        api.get('/parties?type=customer'),
        api.get('/accounts'),
      ]);
      setParties(pRes.data.parties || []);
      setAccounts(aRes.data.accounts || []);

      // Default to primary cash account
      const defaultAcc = aRes.data.accounts?.find((a) => a.isDefault) || aRes.data.accounts?.[0];
      if (defaultAcc) setSelectedAccountId(defaultAcc._id);
    } catch (err) {
      console.error(err);
    }
  };

  const currentPartyObj = parties.find((p) => p._id === selectedPartyId) || preselectedParty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartyId) {
      setError('Please select a customer');
      return;
    }
    if (!selectedAccountId) {
      setError('Please select receiving account (Cash/Bank)');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/parties/${selectedPartyId}/receive-payment`, {
        accountId: selectedAccountId,
        amount: numAmount,
        date,
        reference,
        description,
      });

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Customer Payment (Wusooli)">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Brother Attribution Header */}
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Recording Brother:</span>
          <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
        </div>

        {/* Party Selector */}
        <div className="form-group">
          <label className="form-label">Customer / Party *</label>
          <select
            className="form-select"
            value={selectedPartyId}
            onChange={(e) => {
              setSelectedPartyId(e.target.value);
              const p = parties.find((item) => item._id === e.target.value);
              if (p && p.currentBalance > 0) setAmount(p.currentBalance);
            }}
            required
          >
            <option value="">-- Select Customer --</option>
            {parties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (Due: {formatCurrency(p.currentBalance)})
              </option>
            ))}
          </select>
        </div>

        {currentPartyObj && (
          <div style={{ margin: '-0.5rem 0 1rem 0', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
            Current Receivable from {currentPartyObj.name}: {formatCurrency(currentPartyObj.currentBalance || currentPartyObj.remainingAmount)}
          </div>
        )}

        {/* Amount */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Amount to Receive (Rs.) *</label>
            {currentPartyObj && currentPartyObj.currentBalance > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.3rem' }}
                onClick={() => setAmount(currentPartyObj.currentBalance)}
              >
                Pay Full Balance ({formatCurrency(currentPartyObj.currentBalance)})
              </button>
            )}
          </div>
          <input
            type="number"
            className="form-control amount-font"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="any"
            required
          />
        </div>

        {/* Destination Account */}
        <div className="form-group">
          <label className="form-label">Deposit into Account (Cash / Bank) *</label>
          <select
            className="form-select"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            required
          >
            <option value="">-- Select Cash or Bank Account --</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name} ({acc.type.toUpperCase()}) - Current: {formatCurrency(acc.currentBalance)}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Reference */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reference / Slip #</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cash / Online Trx ID"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Notes / Description</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Received weekly installment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment In (Wusool)'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickReceiveModal;
