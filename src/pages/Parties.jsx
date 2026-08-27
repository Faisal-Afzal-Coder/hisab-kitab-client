import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, PlusCircle, Phone, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import PartyModal from '../components/forms/PartyModal';
import QuickReceiveModal from '../components/forms/QuickReceiveModal';
import QuickPayModal from '../components/forms/QuickPayModal';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Parties = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [parties, setParties] = useState([]);
  const [summary, setSummary] = useState({ totalParties: 0, totalReceivables: 0, totalPayables: 0, netBalance: 0 });
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editParty, setEditParty] = useState(null);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);

  useEffect(() => {
    loadParties();
  }, [type, status, search, refreshKey]);

  const loadParties = async () => {
    setLoading(true);
    try {
      let url = `/parties?type=${type}&status=${status}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setParties(res.data.parties || []);
      setSummary(res.data.summary || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={26} color="var(--primary)" /> All Parties & Khata Accounts
          </h1>
          <div className="page-subtitle">
            Manage customer and supplier ledger profiles, contact details, and balance status
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditParty(null);
            setPartyModalOpen(true);
          }}
        >
          <PlusCircle size={16} /> + Add New Party
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Parties</div>
            <div className="stat-value">{summary.totalParties || 0}</div>
          </div>
        </div>

        <div className="stat-card receivable">
          <div>
            <div className="stat-label">Total Receivables (Lene)</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {formatCurrency(summary.totalReceivables || 0)}
            </div>
          </div>
        </div>

        <div className="stat-card payable">
          <div>
            <div className="stat-label">Total Payables (Dene)</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {formatCurrency(summary.totalPayables || 0)}
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div>
            <div className="stat-label">Net Market Balance</div>
            <div className="stat-value" style={{ color: summary.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
              {formatCurrency(summary.netBalance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search party by name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All Party Types</option>
              <option value="customer">Customers Only</option>
              <option value="supplier">Suppliers Only</option>
              <option value="both">Both (Customer & Supplier)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Balance Statuses</option>
              <option value="receivable">Lene Hain (Receivable &gt; 0)</option>
              <option value="payable">Dene Hain (Payable &gt; 0)</option>
              <option value="settled">Settled (0 Balance)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parties Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Current Balance</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading parties...
                </td>
              </tr>
            ) : parties.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No parties found.
                </td>
              </tr>
            ) : (
              parties.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link
                      to={`/parties/${p._id}`}
                      style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                      {p.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span>{p.phone || '-'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.address || '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-font" style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: p.currentBalance > 0.01 ? '#2563eb' : p.currentBalance < -0.01 ? '#ef4444' : '#10b981',
                    }}>
                      {formatCurrency(Math.abs(p.currentBalance))}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.currentBalance > 0.01 ? (
                      <span className="badge badge-info">LENE HAIN</span>
                    ) : p.currentBalance < -0.01 ? (
                      <span className="badge badge-danger">DENE HAIN</span>
                    ) : (
                      <span className="badge badge-success">SETTLED</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                      {p.currentBalance > 0.01 && (
                        <button
                          className="btn btn-success btn-icon btn-sm"
                          onClick={() => { setSelectedParty(p); setReceiveModalOpen(true); }}
                          title="Receive Payment"
                        >
                          <ArrowDownLeft size={14} />
                        </button>
                      )}

                      {p.currentBalance < -0.01 && (
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => { setSelectedParty(p); setPayModalOpen(true); }}
                          title="Pay Supplier"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      )}

                      <Link
                        to={`/parties/${p._id}`}
                        className="btn btn-outline btn-icon btn-sm"
                        title="View Khata Statement"
                      >
                        <FileText size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <PartyModal
        isOpen={partyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        party={editParty}
        onSuccess={() => { triggerRefresh(); loadParties(); }}
      />

      <QuickReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        preselectedParty={selectedParty}
        onSuccess={() => { triggerRefresh(); loadParties(); }}
      />

      <QuickPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        preselectedParty={selectedParty}
        onSuccess={() => { triggerRefresh(); loadParties(); }}
      />
    </div>
  );
};

export default Parties;
