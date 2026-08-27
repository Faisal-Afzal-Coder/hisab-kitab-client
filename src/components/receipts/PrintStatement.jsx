import React from 'react';
import { Printer, MessageCircle } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

const PrintStatement = ({ statementData }) => {
  const { business, formatCurrency } = useBusiness();

  if (!statementData || !statementData.party) return null;
  const { party, statementEntries, finalBalance, balanceStatus } = statementData;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppReminder = () => {
    const statusText = balanceStatus === 'receivable' ? 'Baqaya Wusool Talab (Receivable)' : 'Dene Hain (Payable)';
    const text = `Assalam-o-Alaikum ${party.name},\n\nThis is an account statement update from *${business?.name || 'Khan Brothers'}*.\n\n*Current Balance:* ${formatCurrency(finalBalance)} (${statusText})\n\nThank you for your cooperation!`;
    const encoded = encodeURIComponent(text);
    const phoneClean = party.phone?.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean ? (phoneClean.startsWith('0') ? '92' + phoneClean.slice(1) : phoneClean) : ''}?text=${encoded}`, '_blank');
  };

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="btn btn-success btn-sm" onClick={handleWhatsAppReminder} title="Share reminder on WhatsApp">
          <MessageCircle size={15} /> WhatsApp Statement
        </button>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={15} /> Print Statement
        </button>
      </div>

      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        color: '#000000',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #e2e8f0',
        fontFamily: 'var(--font-sans)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
              {business?.name || 'Khan Brothers Joint Trading Co.'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              {business?.address || 'Main Commercial Area'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Phone: {business?.phone || '+92 300 1234567'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
              Account Khata Statement
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Party Profile Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Party Name:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{party.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Ph: {party.phone || 'N/A'} | Type: {party.type.toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Net Khata Balance:</span>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: balanceStatus === 'receivable' ? '#2563eb' : balanceStatus === 'payable' ? '#dc2626' : '#16a34a',
            }}>
              {formatCurrency(finalBalance)}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {balanceStatus === 'receivable' ? 'Lene Hain (Receivable)' : balanceStatus === 'payable' ? 'Dene Hain (Payable)' : 'Settled (Nill)'}
            </div>
          </div>
        </div>

        {/* Ledger Entries Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Trx # / Type</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '8px', color: '#2563eb' }}>Debit (Lene)</th>
              <th style={{ textAlign: 'right', padding: '8px', color: '#16a34a' }}>Credit (Dene)</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Balance</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Brother</th>
            </tr>
          </thead>
          <tbody>
            {statementEntries?.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{new Date(entry.date).toLocaleDateString()}</td>
                <td style={{ padding: '8px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {entry.transactionNumber}
                </td>
                <td style={{ padding: '8px' }}>{entry.description}</td>
                <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'var(--font-mono)', color: entry.debit > 0 ? '#2563eb' : '#94a3b8' }}>
                  {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'var(--font-mono)', color: entry.credit > 0 ? '#16a34a' : '#94a3b8' }}>
                  {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(Math.abs(entry.runningBalance))}
                  <span style={{ fontSize: '0.7rem', marginLeft: '3px', color: entry.runningBalance > 0 ? '#2563eb' : entry.runningBalance < 0 ? '#dc2626' : '#16a34a' }}>
                    {entry.runningBalance > 0 ? 'Dr' : entry.runningBalance < 0 ? 'Cr' : ''}
                  </span>
                </td>
                <td style={{ textAlign: 'center', padding: '8px', fontSize: '0.75rem' }}>
                  {entry.createdByName || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
          <div>For any discrepancy, please contact business management.</div>
          <div>Authorized Sign: ____________________</div>
        </div>
      </div>
    </div>
  );
};

export default PrintStatement;
