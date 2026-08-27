import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  MessageCircle,
  Edit2,
  Calendar,
} from 'lucide-react';
import PrintStatement from '../components/receipts/PrintStatement';
import QuickReceiveModal from '../components/forms/QuickReceiveModal';
import QuickPayModal from '../components/forms/QuickPayModal';
import PartyModal from '../components/forms/PartyModal';
import BrotherBadge from '../components/common/BrotherBadge';
import Modal from '../components/common/Modal';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const PartyDetail = () => {
  const { id } = useParams();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Actions modals
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [partyModalOpen, setPartyModalOpen] = useState(false);

  useEffect(() => {
    loadPartyStatement();
  }, [id, refreshKey]);

  const loadPartyStatement = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/parties/${id}/statement`);
      setStatementData(res.data.statement);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        Loading Party Khata Statement...
      </div>
    );
  }

  if (!statementData || !statementData.party) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        Party not found. <Link to="/parties">Back to Parties</Link>
      </div>
    );
  }

  const { party, statementEntries, finalBalance, balanceStatus } = statementData;

  return (
    <div className="page-container">
      {/* Back Button & Top Navigation */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/parties" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Parties
        </Link>
      </div>

      {/* Header with Profile & Balance Snapshot */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{party.name}</h1>
              <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                {party.type}
              </span>
              <button
                className="btn btn-outline btn-icon btn-sm"
                onClick={() => setPartyModalOpen(true)}
                title="Edit Profile"
              >
                <Edit2 size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {party.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} /> {party.phone}
                </div>
              )}
              {party.address && <div>Address: {party.address}</div>}
              <div>Credit Limit: {formatCurrency(party.creditLimit)}</div>
            </div>
          </div>

          {/* Balance & Action Buttons */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div>
              <div className="stat-label">Current Khata Balance</div>
              <div
                className="amount-font"
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: balanceStatus === 'receivable' ? '#2563eb' : balanceStatus === 'payable' ? '#ef4444' : '#10b981',
                }}
              >
                {formatCurrency(finalBalance)}
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: balanceStatus === 'receivable' ? '#2563eb' : balanceStatus === 'payable' ? '#ef4444' : '#10b981',
              }}>
                {balanceStatus === 'receivable' ? 'Lene Hain (Receivable)' : balanceStatus === 'payable' ? 'Dene Hain (Payable)' : 'Settled (Nill)'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-success btn-sm"
                onClick={() => setReceiveModalOpen(true)}
              >
                <ArrowDownLeft size={15} /> + Receive Payment
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setPayModalOpen(true)}
              >
                <ArrowUpRight size={15} /> - Make Payment
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPrintModalOpen(true)}
              >
                <Printer size={15} /> Print / Share Khata
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Running Ledger Statement Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Detailed Account Statement (Rojnamcha Khata)
        </h3>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Trx / Ref #</th>
                <th>Description</th>
                <th>Account</th>
                <th style={{ textAlign: 'right', color: '#2563eb' }}>Debit / Dr (Lene)</th>
                <th style={{ textAlign: 'right', color: '#16a34a' }}>Credit / Cr (Dene)</th>
                <th style={{ textAlign: 'right' }}>Running Balance</th>
                <th style={{ textAlign: 'center' }}>Brother</th>
              </tr>
            </thead>
            <tbody>
              {statementEntries.map((entry, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {entry.transactionNumber}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {entry.description}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {entry.accountName || '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: entry.debit > 0 ? '#2563eb' : 'var(--text-muted)' }}>
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: entry.credit > 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-font" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {formatCurrency(Math.abs(entry.runningBalance))}
                    </span>
                    <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: entry.runningBalance > 0 ? '#2563eb' : entry.runningBalance < 0 ? '#ef4444' : '#10b981' }}>
                      {entry.runningBalance > 0.01 ? 'Dr (Lene)' : entry.runningBalance < -0.01 ? 'Cr (Dene)' : ''}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {entry.createdByName ? (
                      <BrotherBadge name={entry.createdByName} brotherIndex={entry.brotherIndex} avatarColor={entry.avatarColor} />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Statement Modal */}
      {printModalOpen && (
        <Modal isOpen={printModalOpen} onClose={() => setPrintModalOpen(false)} title="Print / Share Party Statement" size="lg">
          <PrintStatement statementData={statementData} />
        </Modal>
      )}

      {/* Receive Modal */}
      <QuickReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        preselectedParty={party}
        onSuccess={() => { triggerRefresh(); loadPartyStatement(); }}
      />

      {/* Pay Modal */}
      <QuickPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        preselectedParty={party}
        onSuccess={() => { triggerRefresh(); loadPartyStatement(); }}
      />

      {/* Edit Party Modal */}
      <PartyModal
        isOpen={partyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        party={party}
        onSuccess={() => { triggerRefresh(); loadPartyStatement(); }}
      />
    </div>
  );
};

export default PartyDetail;
