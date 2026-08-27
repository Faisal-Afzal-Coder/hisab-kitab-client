import React, { useState, useEffect } from 'react';
import { Wallet, ArrowLeftRight, PlusCircle, Building, Smartphone, CheckCircle } from 'lucide-react';
import Modal from '../components/common/Modal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Accounts = () => {
  const { user } = useAuth();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ totalBalance: 0, totalCash: 0, totalBank: 0 });
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedAccountForView, setSelectedAccountForView] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);

  // Create Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferNotes, setTransferNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [refreshKey]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.accounts || []);
      setSummary(res.data.summary || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleViewAccount = async (acc) => {
    setSelectedAccountForView(acc);
    try {
      const res = await api.get(`/accounts/${acc._id}`);
      setAccountTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter account name');
      return;
    }
    setFormLoading(true);
    setFormError('');

    try {
      await api.post('/accounts', {
        name,
        type,
        bankName,
        accountNumber,
        openingBalance: Number(openingBalance) || 0,
      });
      setFormLoading(false);
      setCreateModalOpen(false);
      setName('');
      setBankName('');
      setAccountNumber('');
      setOpeningBalance('');
      triggerRefresh();
      loadAccounts();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId) {
      setFormError('Please select both accounts');
      return;
    }
    if (fromAccountId === toAccountId) {
      setFormError('Source and Destination accounts must be different');
      return;
    }
    const numAmount = Number(transferAmount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than zero');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await api.post('/accounts/transfer', {
        fromAccountId,
        toAccountId,
        amount: numAmount,
        date: transferDate,
        description: transferNotes,
      });

      setFormLoading(false);
      setTransferModalOpen(false);
      setTransferAmount('');
      setTransferNotes('');
      triggerRefresh();
      loadAccounts();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.response?.data?.message || 'Failed to transfer funds');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Wallet size={26} color="var(--primary)" /> Cash & Bank Accounts
          </h1>
          <div className="page-subtitle">
            Manage cash drawers, bank accounts, mobile wallets, and inter-account transfers
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setTransferModalOpen(true)}>
            <ArrowLeftRight size={16} /> Transfer Funds (Muntaqil)
          </button>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle size={16} /> + New Account
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card success">
          <div>
            <div className="stat-label">Total Liquid Funds</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {formatCurrency(summary.totalBalance)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All cash & banks combined</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div>
            <div className="stat-label">Cash in Hand (Naqd)</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {formatCurrency(summary.totalCash)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Physical drawer cash</div>
          </div>
        </div>

        <div className="stat-card receivable">
          <div>
            <div className="stat-label">Bank & Digital Accounts</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              {formatCurrency(summary.totalBank)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank deposits & wallets</div>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: selectedAccountForView?._id === acc._id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            }}
            onClick={() => handleViewAccount(acc)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                  {acc.type}
                </span>
                {acc.isDefault && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <CheckCircle size={12} /> Default
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{acc.name}</h3>
              {acc.bankName && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{acc.bankName}</div>}
              {acc.accountNumber && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>A/C: {acc.accountNumber}</div>}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance:</span>
                <div className="amount-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: acc.currentBalance >= 0 ? 'var(--text-primary)' : '#ef4444' }}>
                  {formatCurrency(acc.currentBalance)}
                </div>
              </div>

              <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); handleViewAccount(acc); }}>
                View Passbook
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Passbook / Statement Table */}
      {selectedAccountForView && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Passbook Statement: {selectedAccountForView.name}
            </h3>
            <span className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
              Balance: {formatCurrency(selectedAccountForView.currentBalance)}
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trx #</th>
                  <th>Type</th>
                  <th>Party / Description</th>
                  <th style={{ textAlign: 'right' }}>Deposit In (+)</th>
                  <th style={{ textAlign: 'right' }}>Withdrawal Out (-)</th>
                  <th style={{ textAlign: 'center' }}>Brother</th>
                </tr>
              </thead>
              <tbody>
                {accountTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No transactions found for this account.
                    </td>
                  </tr>
                ) : (
                  accountTransactions.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {t.transactionNumber}
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.partyName || t.description}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {t.moneyIn > 0 ? (
                          <span className="money-in">+{formatCurrency(t.moneyIn)}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {t.moneyOut > 0 ? (
                          <span className="money-out">-{formatCurrency(t.moneyOut)}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <BrotherBadge name={t.createdByName} brotherIndex={t.brotherIndex} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {createModalOpen && (
        <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Cash or Bank Account">
          <form onSubmit={handleCreateAccount}>
            {formError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Account Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Meezan Bank / HBL / Shop Tijori"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash in Hand / Drawer</option>
                  <option value="wallet">Mobile Wallet (EasyPaisa/JazzCash)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Opening Balance (Rs.)</label>
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
            </div>

            {type === 'bank' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Meezan Bank Ltd"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account / IBAN Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0102-0105849"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Modal */}
      {transferModalOpen && (
        <Modal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} title="Transfer Funds Between Accounts">
          <form onSubmit={handleTransfer}>
            {formError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transferring Brother:</span>
              <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">From Account (Source) *</label>
                <select
                  className="form-select"
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  required
                >
                  <option value="">-- From Account --</option>
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({formatCurrency(a.currentBalance)})
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
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({formatCurrency(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transfer Amount (Rs.) *</label>
              <input
                type="number"
                className="form-control amount-font"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cash withdrawal from bank for market trading"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setTransferModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Transferring...' : 'Execute Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Accounts;
