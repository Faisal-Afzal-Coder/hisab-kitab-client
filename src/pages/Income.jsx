import React, { useState, useEffect } from 'react';
import { TrendingUp, PlusCircle, Search } from 'lucide-react';
import TransactionModal from '../components/forms/TransactionModal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Income = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadIncomes();
  }, [search, refreshKey]);

  const loadIncomes = async () => {
    setLoading(true);
    try {
      let url = '/transactions?type=income';
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setIncomes(res.data.transactions || []);
      setTotalIncome(res.data.summary?.totalMoneyIn || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#10b981' }}>
            <TrendingUp size={26} /> Income & Money Received (Aamadni)
          </h1>
          <div className="page-subtitle">
            Direct revenue, commission, and other business cash receipts
          </div>
        </div>

        <button className="btn btn-success" onClick={() => setModalOpen(true)}>
          <PlusCircle size={16} /> + Record Income
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div className="stat-label">Total Other Income Received</div>
          <div className="amount-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>

        <div style={{ minWidth: '260px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search income receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Trx Number</th>
              <th>Income Title / Description</th>
              <th>Category</th>
              <th>Deposited In Account</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Brother</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading income records...</td></tr>
            ) : incomes.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No income entries recorded yet.</td></tr>
            ) : (
              incomes.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{t.transactionNumber}</td>
                  <td style={{ fontWeight: 600 }}>{t.description}</td>
                  <td><span className="badge badge-secondary">{t.category || 'Direct Income'}</span></td>
                  <td>{t.accountName}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="money-in" style={{ fontSize: '1rem' }}>+{formatCurrency(t.amount)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <BrotherBadge name={t.createdByName} brotherIndex={t.brotherIndex} avatarColor={t.avatarColor} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType="income"
        onSuccess={() => { triggerRefresh(); loadIncomes(); }}
      />
    </div>
  );
};

export default Income;
