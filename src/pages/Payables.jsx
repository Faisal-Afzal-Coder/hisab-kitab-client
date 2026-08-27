import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Search,
  PlusCircle,
  Phone,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import QuickPayModal from '../components/forms/QuickPayModal';
import PartyModal from '../components/forms/PartyModal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Payables = () => {
  const { user } = useAuth();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [parties, setParties] = useState([]);
  const [totalPayable, setTotalPayable] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPartyForPayment, setSelectedPartyForPayment] = useState(null);
  const [partyModalOpen, setPartyModalOpen] = useState(false);

  useEffect(() => {
    loadPayables();
  }, [search, refreshKey]);

  const loadPayables = async () => {
    setLoading(true);
    try {
      let url = '/parties/payables';
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setParties(res.data.parties || []);
      setTotalPayable(res.data.totalPayable || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenPay = (party) => {
    setSelectedPartyForPayment(party);
    setPayModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#ef4444' }}>
            <ArrowUpRight size={28} /> Dene Hain (Supplier Payables)
          </h1>
          <div className="page-subtitle">
            All suppliers, mills, and vendors to whom the business owes outstanding money
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setPartyModalOpen(true)}>
            <PlusCircle size={16} /> + New Supplier
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              setSelectedPartyForPayment(null);
              setPayModalOpen(true);
            }}
          >
            <ArrowUpRight size={16} /> - Make Payment (Adaigi)
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
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
          <div className="stat-label">Total Outstanding Supplier Payables (Kul Dene Hain)</div>
          <div className="amount-font" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
            {formatCurrency(totalPayable)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Calculated strictly from purchase invoices and payment ledger entries
          </div>
        </div>

        {/* Search */}
        <div style={{ minWidth: '260px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search supplier by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Payables Data Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact / Phone</th>
              <th style={{ textAlign: 'right' }}>Total Purchased</th>
              <th style={{ textAlign: 'right' }}>Total Paid</th>
              <th style={{ textAlign: 'right' }}>Remaining (Dene Hain)</th>
              <th>Last Transaction</th>
              <th style={{ textAlign: 'center' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading payables list...
                </td>
              </tr>
            ) : parties.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    No pending supplier payables!
                  </div>
                  All vendor accounts are fully paid.
                </td>
              </tr>
            ) : (
              parties.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link
                      to={`/parties/${p._id}`}
                      style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.925rem' }}
                    >
                      {p.name}
                    </Link>
                    {p.address && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{p.address}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span>{p.phone || 'No phone'}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(p.totalPayable)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                    {formatCurrency(p.totalPaid)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
                      {formatCurrency(p.remainingPayable)}
                    </span>
                  </td>
                  <td>
                    {p.lastTransaction ? (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {formatCurrency(p.lastTransaction.amount)} ({p.lastTransaction.type.replace('_', ' ')})
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(p.lastTransaction.date).toLocaleDateString()} • {p.lastTransaction.createdByName?.split(' ')[0]}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opening Balance</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                      {/* Pay Supplier Action Button */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOpenPay(p)}
                        title="Make Payment to Supplier"
                      >
                        <ArrowUpRight size={14} /> Pay Supplier
                      </button>

                      {/* View Statement Link */}
                      <Link
                        to={`/parties/${p._id}`}
                        className="btn btn-outline btn-icon btn-sm"
                        title="View Full Khata Statement"
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

      {/* Quick Pay Modal */}
      <QuickPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        preselectedParty={selectedPartyForPayment}
        onSuccess={() => {
          triggerRefresh();
          loadPayables();
        }}
      />

      {/* New Party Modal */}
      <PartyModal
        isOpen={partyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadPayables();
        }}
      />
    </div>
  );
};

export default Payables;
