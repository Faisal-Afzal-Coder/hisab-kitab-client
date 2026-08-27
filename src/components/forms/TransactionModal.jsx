import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import BrotherBadge from '../common/BrotherBadge';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import api from '../../services/api';

const TransactionModal = ({ isOpen, onClose, initialType = 'income', onSuccess }) => {
  const { user } = useAuth();
  const { formatCurrency } = useBusiness();

  const [type, setType] = useState(initialType);
  const [parties, setParties] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setError('');
      loadData();
      setAmount('');
      setTitle('');
      setCategory('');
      setReference('');
      setDescription('');
      setSelectedPartyId('');
    }
  }, [isOpen, initialType]);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        api.get('/parties'),
        api.get('/accounts'),
      ]);
      setParties(pRes.data.parties || []);
      setAccounts(aRes.data.accounts || []);

      const defaultAcc = aRes.data.accounts?.find((a) => a.isDefault) || aRes.data.accounts?.[0];
      if (defaultAcc) setSelectedAccountId(defaultAcc._id);
      if (aRes.data.accounts?.length > 1) {
        const otherAcc = aRes.data.accounts.find((a) => a._id !== defaultAcc?._id);
        if (otherAcc) setToAccountId(otherAcc._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please provide a valid amount greater than zero');
      return;
    }

    if (type === 'transfer' && (!selectedAccountId || !toAccountId)) {
      setError('Please select both source and destination accounts');
      return;
    }

    if (type === 'transfer' && selectedAccountId === toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    if ((type === 'payment_in' || type === 'payment_out') && !selectedPartyId) {
      setError('Please select a party');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions', {
        type,
        partyId: selectedPartyId || null,
        accountId: selectedAccountId,
        toAccountId: toAccountId || null,
        amount: numAmount,
        title: title || description,
        category,
        date,
        reference,
        description,
      });

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to record transaction');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Business Transaction">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Brother attribution */}
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Recording Brother:</span>
          <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
        </div>

        {/* Transaction Type Selector */}
        <div className="form-group">
          <label className="form-label">Transaction Type *</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="income">Income / Money Received (Aamadni)</option>
            <option value="expense">Expense / Money Paid (Kharcha)</option>
            <option value="payment_in">Customer Payment In (Wusool)</option>
            <option value="payment_out">Supplier Payment Out (Adaigi)</option>
            <option value="transfer">Account Transfer (Cash &lt;-&gt; Bank)</option>
          </select>
        </div>

        {/* Party (if payment_in or payment_out or optional for income) */}
        {(type === 'payment_in' || type === 'payment_out' || type === 'income') && (
          <div className="form-group">
            <label className="form-label">
              Party {type !== 'income' ? '*' : '(Optional)'}
            </label>
            <select
              className="form-select"
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              required={type === 'payment_in' || type === 'payment_out'}
            >
              <option value="">-- Select Party --</option>
              {parties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.type.toUpperCase()}) - Balance: {formatCurrency(p.currentBalance)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title / Description */}
        <div className="form-group">
          <label className="form-label">
            {type === 'expense' ? 'Expense Title / Purpose *' : 'Description / Reason *'}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={
              type === 'expense'
                ? 'e.g. Shop Rent / Utility Bill / Tea'
                : 'e.g. Daily market sales / Commission'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category (for Expense / Income) */}
        {(type === 'expense' || type === 'income') && (
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              {type === 'expense' ? (
                <>
                  <option value="Rent & Premises">Rent & Premises</option>
                  <option value="Utilities & Bills">Utilities & Electricity Bills</option>
                  <option value="Salaries & Wages">Salaries & Wages</option>
                  <option value="Refreshment & Tea">Refreshment & Tea</option>
                  <option value="Fuel & Transportation">Fuel & Transportation</option>
                  <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                  <option value="Marketing & Printing">Marketing & Printing</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </>
              ) : (
                <>
                  <option value="Direct Sales">Direct Sales Revenue</option>
                  <option value="Commission">Commission</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Partner Deposit">Partner Deposit</option>
                  <option value="Other Income">Other Income</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount (Rs.) *</label>
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

        {/* Accounts */}
        {type === 'transfer' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">From Account (Source) *</label>
              <select
                className="form-select"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
              >
                <option value="">-- From Account --</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name} ({formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Account (Destination) *</label>
              <select
                className="form-select"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
              >
                <option value="">-- To Account --</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name} ({formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">
              {type === 'expense' || type === 'payment_out' ? 'Paid From Account *' : 'Deposit Into Account *'}
            </label>
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
        )}

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
            <label className="form-label">Reference #</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Receipt / Slip / Cheque"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn ${type === 'expense' || type === 'payment_out' ? 'btn-danger' : 'btn-success'}`}
            disabled={loading}
          >
            {loading ? 'Recording...' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
