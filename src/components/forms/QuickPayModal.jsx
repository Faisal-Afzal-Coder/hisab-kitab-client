import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import BrotherBadge from '../common/BrotherBadge';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import api from '../../services/api';

const QuickPayModal = ({ isOpen, onClose, preselectedParty = null, onSuccess }) => {
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
        const absBal = Math.abs(preselectedParty.remainingPayable || preselectedParty.currentBalance || 0);
        setAmount(absBal || '');
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
        api.get('/parties?type=supplier'),
        api.get('/accounts'),
      ]);
      setParties(pRes.data.parties || []);
      setAccounts(aRes.data.accounts || []);

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
      setError('Please select a supplier');
      return;
    }
    if (!selectedAccountId) {
      setError('Please select paying account (Cash/Bank)');
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
      await api.post(`/parties/${selectedPartyId}/make-payment`, {
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
      setError(err.response?.data?.message || 'Failed to make payment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make Supplier Payment (Adaigi)">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Brother Attribution Header */}
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Paying Brother:</span>
          <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
        </div>

        {/* Party Selector */}
        <div className="form-group">
          <label className="form-label">Supplier / Party *</label>
          <select
            className="form-select"
            value={selectedPartyId}
            onChange={(e) => {
              setSelectedPartyId(e.target.value);
              const p = parties.find((item) => item._id === e.target.value);
              if (p && p.currentBalance < 0) setAmount(Math.abs(p.currentBalance));
            }}
            required
          >
            <option value="">-- Select Supplier --</option>
            {parties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (Payable: {formatCurrency(Math.abs(p.currentBalance))})
              </option>
            ))}
          </select>
        </div>

        {currentPartyObj && (
          <div style={{ margin: '-0.5rem 0 1rem 0', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
            Current Payable to {currentPartyObj.name}: {formatCurrency(Math.abs(currentPartyObj.currentBalance || currentPartyObj.remainingPayable || 0))}
          </div>
        )}

        {/* Amount */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Amount to Pay (Rs.) *</label>
            {currentPartyObj && currentPartyObj.currentBalance < 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginBottom: '0.3rem' }}
                onClick={() => setAmount(Math.abs(currentPartyObj.currentBalance))}
              >
                Pay Full Due ({formatCurrency(Math.abs(currentPartyObj.currentBalance))})
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

        {/* Source Account */}
        <div className="form-group">
          <label className="form-label">Pay From Account (Cash / Bank) *</label>
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
            <label className="form-label">Reference / Cheque #</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cheque / Slip / Cash"
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
            placeholder="e.g. Paid supplier invoice installment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment Out (Adaigi)'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickPayModal;
