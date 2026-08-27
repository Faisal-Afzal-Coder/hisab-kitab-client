import React, { useState, useEffect } from 'react';
import { Receipt, PlusCircle, Search, PieChart } from 'lucide-react';
import TransactionModal from '../components/forms/TransactionModal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Expenses = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [category, search, refreshKey]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      let url = `/expenses?category=${category}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setExpenses(res.data.expenses || []);
      setTotalExpenses(res.data.totalExpenses || 0);
      setCategoryBreakdown(res.data.categoryBreakdown || []);
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
          <h1 className="page-title" style={{ color: '#ef4444' }}>
            <Receipt size={26} /> Business Expenses (Kharchay)
          </h1>
          <div className="page-subtitle">
            Track and categorize shop rent, utility bills, salaries, refreshment, and operational costs
          </div>
        </div>

        <button className="btn btn-danger" onClick={() => setModalOpen(true)}>
          <PlusCircle size={16} /> + Record Expense
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card payable">
          <div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {formatCurrency(totalExpenses)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{expenses.length} Expense vouchers</div>
          </div>
        </div>

        {categoryBreakdown.slice(0, 3).map((cat, idx) => (
          <div key={idx} className="stat-card">
            <div>
              <div className="stat-label">{cat.category}</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                {formatCurrency(cat.amount)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.percentage}% of total expenses</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search expenses by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Expense Categories</option>
              <option value="Rent & Premises">Rent & Premises</option>
              <option value="Utilities & Bills">Utilities & Bills</option>
              <option value="Salaries & Wages">Salaries & Wages</option>
              <option value="Refreshment & Tea">Refreshment & Tea</option>
              <option value="Fuel & Transportation">Fuel & Transportation</option>
              <option value="Maintenance & Repairs">Maintenance & Repairs</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense Title</th>
              <th>Category</th>
              <th>Paid From Account</th>
              <th>Notes</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
              <th style={{ textAlign: 'center' }}>Brother</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No expense records found.</td></tr>
            ) : (
              expenses.map((e) => (
                <tr key={e._id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>{e.title}</td>
                  <td><span className="badge badge-secondary">{e.category}</span></td>
                  <td>{e.accountName || e.accountId?.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.notes || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="money-out" style={{ fontSize: '1rem' }}>-{formatCurrency(e.amount)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <BrotherBadge name={e.createdByName} brotherIndex={e.brotherIndex} />
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
        initialType="expense"
        onSuccess={() => { triggerRefresh(); loadExpenses(); }}
      />
    </div>
  );
};

export default Expenses;
