import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  Search,
  PlusCircle,
  MessageCircle,
  Phone,
  FileText,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import QuickReceiveModal from '../components/forms/QuickReceiveModal';
import PartyModal from '../components/forms/PartyModal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Receivables = () => {
  const { user } = useAuth();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [parties, setParties] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPartyForPayment, setSelectedPartyForPayment] = useState(null);
  const [partyModalOpen, setPartyModalOpen] = useState(false);

  useEffect(() => {
    loadReceivables();
  }, [search, refreshKey]);

  const loadReceivables = async () => {
    setLoading(true);
    try {
      let url = '/parties/receivables';
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setParties(res.data.parties || []);
      setTotalReceivable(res.data.totalReceivable || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenReceive = (party) => {
    setSelectedPartyForPayment(party);
    setReceiveModalOpen(true);
  };

  const handleSendWhatsApp = (party) => {
    const text = `Assalam-o-Alaikum ${party.name},\n\nThis is a friendly reminder from *Khan Brothers Joint Trading*.\n\nYour current outstanding payable amount is *${formatCurrency(party.remainingAmount)}*.\n\nPlease clear the balance at your earliest convenience. Thank you!`;
    const encoded = encodeURIComponent(text);
    const phoneClean = party.phone?.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean ? (phoneClean.startsWith('0') ? '92' + phoneClean.slice(1) : phoneClean) : ''}?text=${encoded}`, '_blank');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#2563eb' }}>
            <ArrowDownLeft size={28} /> Lene Hain (Customer Receivables)
          </h1>
          <div className="page-subtitle">
            All customers and market parties from whom the joint business has to receive money
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setPartyModalOpen(true)}>
            <PlusCircle size={16} /> + New Customer
          </button>
          <button
            className="btn btn-success"
            onClick={() => {
              setSelectedPartyForPayment(null);
              setReceiveModalOpen(true);
            }}
          >
            <ArrowDownLeft size={16} /> + Receive Payment (Wusooli)
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
          <div className="stat-label">Total Outstanding Market Receivables (Kul Lene Hain)</div>
          <div className="amount-font" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
            {formatCurrency(totalReceivable)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Calculated strictly from actual transactions and opening balance ledgers
          </div>
        </div>

        {/* Search */}
        <div style={{ minWidth: '260px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search customer by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Receivables Data Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact / Phone</th>
              <th style={{ textAlign: 'right' }}>Total Billed</th>
              <th style={{ textAlign: 'right' }}>Total Received</th>
              <th style={{ textAlign: 'right' }}>Remaining (Lene Hain)</th>
              <th>Last Transaction</th>
              <th style={{ textAlign: 'center' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading receivables list...
                </td>
              </tr>
            ) : parties.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    No pending receivables!
                  </div>
                  All customer accounts are settled or no receivables found.
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
                    {formatCurrency(p.totalDue)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                    {formatCurrency(p.totalReceived)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>
                      {formatCurrency(p.remainingAmount)}
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
                      {/* Receive Payment Action Button */}
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleOpenReceive(p)}
                        title="Receive Payment from Customer"
                      >
                        <ArrowDownLeft size={14} /> Receive
                      </button>

                      {/* WhatsApp Reminder */}
                      {p.phone && (
                        <button
                          className="btn btn-outline btn-icon btn-sm"
                          onClick={() => handleSendWhatsApp(p)}
                          title="Send WhatsApp Reminder"
                          style={{ color: '#25d366' }}
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}

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

      {/* Quick Receive Modal */}
      <QuickReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        preselectedParty={selectedPartyForPayment}
        onSuccess={() => {
          triggerRefresh();
          loadReceivables();
        }}
      />

      {/* New Party Modal */}
      <PartyModal
        isOpen={partyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadReceivables();
        }}
      />
    </div>
  );
};

export default Receivables;
