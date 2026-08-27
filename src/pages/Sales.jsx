import React, { useState, useEffect } from 'react';
import { ShoppingBag, PlusCircle, Search, Printer, Eye } from 'lucide-react';
import SaleModal from '../components/forms/SaleModal';
import PrintInvoice from '../components/receipts/PrintInvoice';
import Modal from '../components/common/Modal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Sales = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalReceived: 0, totalDue: 0 });
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [printSale, setPrintSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, [search, paymentStatus, refreshKey]);

  const loadSales = async () => {
    setLoading(true);
    try {
      let url = `/sales?paymentStatus=${paymentStatus}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setSales(res.data.sales || []);
      setSummary(res.data.summary || {});
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
            <ShoppingBag size={26} color="var(--primary)" /> Sales & POS Invoices
          </h1>
          <div className="page-subtitle">
            Customer billing, automated inventory deduction, and receivable calculation
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setSaleModalOpen(true)}>
          <PlusCircle size={16} /> + New Sale Bill (POS)
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card success">
          <div>
            <div className="stat-label">Total Sales Volume</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {formatCurrency(summary.totalSales)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sales.length} Invoices generated</div>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Cash Collected</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {formatCurrency(summary.totalReceived)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Immediate cash receipts</div>
          </div>
        </div>

        <div className="stat-card receivable">
          <div>
            <div className="stat-label">Credit Balance Due (Udhaar)</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {formatCurrency(summary.totalDue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Added to customer receivables</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search invoice #, customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="all">All Payment Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Full Credit (Unpaid)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Items</th>
              <th style={{ textAlign: 'right' }}>Total Bill</th>
              <th style={{ textAlign: 'right' }}>Paid (In)</th>
              <th style={{ textAlign: 'right' }}>Due (Udhaar)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Brother</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading sales invoices...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No sale invoices found.</td></tr>
            ) : (
              sales.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.825rem' }}>{s.invoiceNumber}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{s.customerName}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {s.items?.length} item(s)
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(s.netAmount)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(s.paidAmount)}
                  </td>
                  <td style={{ textAlign: 'right', color: s.dueAmount > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(s.dueAmount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${s.paymentStatus === 'paid' ? 'badge-success' : s.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <BrotherBadge name={s.createdByName} brotherIndex={s.brotherIndex} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-outline btn-icon btn-sm"
                      onClick={() => setPrintSale(s)}
                      title="Print / View Invoice"
                    >
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Modal */}
      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSuccess={() => { triggerRefresh(); loadSales(); }}
      />

      {/* Print Invoice Modal */}
      {printSale && (
        <Modal isOpen={!!printSale} onClose={() => setPrintSale(null)} title={`Invoice #${printSale.invoiceNumber}`} size="lg">
          <PrintInvoice sale={printSale} onClose={() => setPrintSale(null)} />
        </Modal>
      )}
    </div>
  );
};

export default Sales;
