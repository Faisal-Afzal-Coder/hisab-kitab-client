import React, { useState, useEffect } from 'react';
import { History, Search, Filter, UserCheck, ShieldCheck } from 'lucide-react';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const ActivityLog = () => {
  const { formatCurrency } = useBusiness();

  const [activities, setActivities] = useState([]);
  const [brotherIndex, setBrotherIndex] = useState('');
  const [module, setModule] = useState('all');
  const [action, setAction] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [brotherIndex, module, action, search, page]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      let url = `/activity?page=${page}&limit=25&module=${module}&action=${action}`;
      if (brotherIndex) url += `&brotherIndex=${brotherIndex}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setActivities(res.data.activities || []);
      setTotalPages(res.data.totalPages || 1);
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
          <h1 className="page-title">
            <History size={26} color="var(--primary)" /> 3 Brothers Activity & Audit Trail
          </h1>
          <div className="page-subtitle">
            Complete transparent log of all operations performed by Brother 1, Brother 2, and Brother 3
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
          <ShieldCheck size={16} color="#10b981" /> Immutable Business Audit Log
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search audit descriptions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={brotherIndex} onChange={(e) => { setBrotherIndex(e.target.value); setPage(1); }}>
              <option value="">All 3 Brothers</option>
              <option value="1">Brother 1 (Ahmed)</option>
              <option value="2">Brother 2 (Bilal)</option>
              <option value="3">Brother 3 (Hamza)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}>
              <option value="all">All Modules</option>
              <option value="Payment">Payments (Wusooli / Adaigi)</option>
              <option value="Sale">Sales Invoices</option>
              <option value="Purchase">Purchase Bills</option>
              <option value="Party">Party Profiles</option>
              <option value="Account">Accounts & Transfers</option>
              <option value="Product">Inventory / Stock</option>
              <option value="Expense">Expenses</option>
              <option value="Transaction">Direct Transactions</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
              <option value="all">All Actions</option>
              <option value="RECEIVE_PAYMENT">Receive Payment</option>
              <option value="MAKE_PAYMENT">Make Payment</option>
              <option value="CREATE">Create New Record</option>
              <option value="UPDATE">Update Details</option>
              <option value="TRANSFER">Account Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Feed Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Brother / User</th>
              <th>Action / Module</th>
              <th>Activity Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Party / Target</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading activity logs...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No activity logs recorded.</td></tr>
            ) : (
              activities.map((act) => (
                <tr key={act._id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <div>{new Date(act.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(act.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <BrotherBadge name={act.userName} brotherIndex={act.brotherIndex} avatarColor={act.avatarColor} />
                  </td>
                  <td>
                    <span className="badge badge-secondary">{act.action}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>{act.module}</span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {act.description}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {act.amount !== null && act.amount !== undefined ? (
                      <span style={{ fontWeight: 700 }}>{formatCurrency(act.amount)}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {act.partyName || act.accountName || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
