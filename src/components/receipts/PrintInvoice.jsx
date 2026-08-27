import React from 'react';
import { Printer } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

const PrintInvoice = ({ sale, onClose }) => {
  const { business, formatCurrency } = useBusiness();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={15} /> Print Bill
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
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
              {business?.name || 'Khan Brothers Joint Trading Co.'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              {business?.address || 'Main Wholesale Market'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Phone: {business?.phone || '+92 300 1234567'} | Tax NTN: {business?.taxNumber || 'N/A'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
              Sale Invoice
            </h3>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              #{sale.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Date: {new Date(sale.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Customer & Brother Attribution Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Billed To:</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{sale.customerName}</div>
            {sale.customerPhone && <div style={{ fontSize: '0.85rem', color: '#475569' }}>Ph: {sale.customerPhone}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Processed By:</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              {sale.createdByName || 'Partner Brother'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Payment Status: <strong style={{ textTransform: 'uppercase', color: sale.paymentStatus === 'paid' ? '#059669' : '#dc2626' }}>{sale.paymentStatus}</strong>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Item / Description</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}>{item.productName}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ textAlign: 'right', padding: '8px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
              <span>Subtotal:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(sale.totalAmount)}</strong>
            </div>
            {sale.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#16a34a' }}>
                <span>Discount:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>- {formatCurrency(sale.discount)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
              <span>Total Bill:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(sale.netAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
              <span>Paid Amount:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#16a34a' }}>{formatCurrency(sale.paidAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.95rem', fontWeight: 700, color: sale.dueAmount > 0 ? '#dc2626' : '#16a34a' }}>
              <span>Balance Due:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(sale.dueAmount)}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <div>{business?.settings?.receiptFooterMessage || 'Thank you for your business!'}</div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>System Generated by Hisab-Kitab Ledger</div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
