import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Download,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import BrotherBadge from '../components/common/BrotherBadge';
import DateFilter from '../components/common/DateFilter';
import Modal from '../components/common/Modal';
import TransactionModal from '../components/forms/TransactionModal';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Ledger = () => {
  const { user, brothers } = useAuth();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  // Filters state
  const [datePreset, setDatePreset] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [brotherIndex, setBrotherIndex] = useState('');
  const [partyId, setPartyId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('');
  const [moneyFlow, setMoneyFlow] = useState(''); // 'in', 'out', or ''
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalMoneyIn: 0, totalMoneyOut: 0, netFlow: 0, totalTransactions: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Dropdown lists
  const [parties, setParties] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Modals
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [datePreset, startDate, endDate, brotherIndex, partyId, accountId, type, moneyFlow, search, page, refreshKey]);

  const loadDropdowns = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        api.get('/parties'),
        api.get('/accounts'),
      ]);
      setParties(pRes.data.parties || []);
      setAccounts(aRes.data.accounts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let url = `/transactions?page=${page}&limit=25`;
      if (datePreset && datePreset !== 'all' && datePreset !== 'custom') {
        url += `&datePreset=${datePreset}`;
      } else if (datePreset === 'custom') {
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
      }

      if (brotherIndex) url += `&brotherIndex=${brotherIndex}`;
      if (partyId) url += `&partyId=${partyId}`;
      if (accountId) url += `&accountId=${accountId}`;
      if (type) url += `&type=${type}`;
      if (moneyFlow) url += `&moneyFlow=${moneyFlow}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(url);
      setTransactions(res.data.transactions || []);
      setSummary(res.data.summary || { totalMoneyIn: 0, totalMoneyOut: 0, netFlow: 0, totalTransactions: 0 });
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={26} color="var(--primary)" /> Complete Business Hisab (Roznamcha)
          </h1>
          <div className="page-subtitle">
            Master unified financial ledger tracking all money inflows, outflows, and brother entries
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handlePrintLedger}>
            <Download size={16} /> Print / Export
          </button>
          <button className="btn btn-primary" onClick={() => setTxnModalOpen(true)}>
            <PlusCircle size={16} /> + New Transaction
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <DateFilter
        selectedPreset={datePreset}
        onPresetChange={(preset) => {
          setDatePreset(preset);
          setPage(1);
          if (preset !== 'custom') {
            setStartDate('');
            setEndDate('');
          }
        }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(val) => { setStartDate(val); setPage(1); }}
        onEndDateChange={(val) => { setEndDate(val); setPage(1); }}
      />

      {/* Advanced Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Search Box */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Ledger</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Trx #, party, notes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Filter by Brother */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Brother</label>
            <select
              className="form-select"
              value={brotherIndex}
              onChange={(e) => { setBrotherIndex(e.target.value); setPage(1); }}
            >
              <option value="">All 3 Brothers</option>
              <option value="1">Brother 1 (Ahmed)</option>
              <option value="2">Brother 2 (Bilal)</option>
              <option value="3">Brother 3 (Hamza)</option>
            </select>
          </div>

          {/* Filter by Party */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Party</label>
            <select
              className="form-select"
              value={partyId}
              onChange={(e) => { setPartyId(e.target.value); setPage(1); }}
            >
              <option value="">All Parties</option>
              {parties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Account */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Account</label>
            <select
              className="form-select"
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
            >
              <option value="">All Cash & Banks</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Type */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Transaction Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="payment_in">Money Received (Wusooli)</option>
              <option value="payment_out">Money Paid (Adaigi)</option>
              <option value="sale">Sale Invoice</option>
              <option value="purchase">Purchase Invoice</option>
              <option value="expense">Expense (Kharcha)</option>
              <option value="income">Direct Income</option>
              <option value="transfer">Account Transfer</option>
            </select>
          </div>

          {/* Filter by Money In / Out */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Money Flow</label>
            <select
              className="form-select"
              value={moneyFlow}
              onChange={(e) => { setMoneyFlow(e.target.value); setPage(1); }}
            >
              <option value="">All Flows</option>
              <option value="in">Money In Only (+)</option>
              <option value="out">Money Out Only (-)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Totals Summary Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="stat-label">Total Money In (Wusool)</div>
          <div className="money-in" style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
            +{formatCurrency(summary.totalMoneyIn)}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="stat-label">Total Money Out (Ada)</div>
          <div className="money-out" style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
            -{formatCurrency(summary.totalMoneyOut)}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="stat-label">Net Ledger Cash Flow</div>
          <div className="amount-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: summary.netFlow >= 0 ? '#10b981' : '#ef4444' }}>
            {summary.netFlow >= 0 ? '+' : ''}{formatCurrency(summary.netFlow)}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div className="stat-label">Total Filtered Entries</div>
          <div className="amount-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {summary.totalTransactions} Trx
          </div>
        </div>
      </div>

      {/* Main Master Ledger Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Trx Number</th>
              <th>Brother (Added By)</th>
              <th>Party</th>
              <th>Type / Category</th>
              <th>Account</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Money In</th>
              <th style={{ textAlign: 'right' }}>Money Out</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading Hisab Ledger entries...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No ledger transactions match the selected filters.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600 }}>{new Date(t.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {t.transactionNumber}
                  </td>
                  <td>
                    <BrotherBadge name={t.createdByName} brotherIndex={t.brotherIndex} avatarColor={t.avatarColor} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.partyName || '-'}</div>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                      {t.type.replace('_', ' ')}
                    </span>
                    {t.category && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.category}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.accountName || '-'}</div>
                    {t.toAccountName && <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>&rarr; {t.toAccountName}</div>}
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.825rem' }}>
                    {t.description}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {t.moneyIn > 0 ? (
                      <span className="money-in">+{formatCurrency(t.moneyIn)}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {t.moneyOut > 0 ? (
                      <span className="money-out">-{formatCurrency(t.moneyOut)}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-outline btn-icon btn-sm"
                      onClick={() => setSelectedTxn(t)}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={`Transaction Detail #${selectedTxn.transactionNumber}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded By:</span>
                <div><BrotherBadge name={selectedTxn.createdByName} brotherIndex={selectedTxn.brotherIndex} /></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timestamp:</span>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(selectedTxn.date).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type:</span>
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedTxn.type.replace('_', ' ')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount:</span>
                <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {formatCurrency(selectedTxn.amount)}
                </div>
              </div>
            </div>

            {selectedTxn.partyName && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Party:</span>
                <div style={{ fontWeight: 700 }}>{selectedTxn.partyName}</div>
              </div>
            )}

            {selectedTxn.accountName && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Account:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.accountName}</div>
              </div>
            )}

            {selectedTxn.description && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notes:</span>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  {selectedTxn.description}
                </div>
              </div>
            )}

            {selectedTxn.items && selectedTxn.items.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Line Items:</span>
                <table className="custom-table" style={{ marginTop: '0.25rem' }}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTxn.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.productName}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadTransactions();
        }}
      />
    </div>
  );
};

export default Ledger;
