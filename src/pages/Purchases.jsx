import React, { useState, useEffect } from 'react';
import { ShoppingCart, PlusCircle, Search, Eye } from 'lucide-react';
import PurchaseModal from '../components/forms/PurchaseModal';
import Modal from '../components/common/Modal';
import BrotherBadge from '../components/common/BrotherBadge';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Purchases = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({ totalPurchases: 0, totalPaid: 0, totalDue: 0 });
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    loadPurchases();
  }, [search, paymentStatus, refreshKey]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      let url = `/purchases?paymentStatus=${paymentStatus}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setPurchases(res.data.purchases || []);
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
            <ShoppingCart size={26} color="var(--primary)" /> Purchases (Kharidari)
          </h1>
          <div className="page-subtitle">
            Supplier purchase invoices, automated inventory increment, and payable calculation
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setPurchaseModalOpen(true)}>
          <PlusCircle size={16} /> + New Purchase Bill
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Purchased Volume</div>
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(summary.totalPurchases)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{purchases.length} Purchase bills recorded</div>
          </div>
        </div>

        <div className="stat-card success">
          <div>
            <div className="stat-label">Total Amount Paid</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {formatCurrency(summary.totalPaid)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Paid out from cash/bank</div>
          </div>
        </div>

        <div className="stat-card payable">
          <div>
            <div className="stat-label">Payable Due (Udhaar)</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {formatCurrency(summary.totalDue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Added to supplier payables</div>
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
                placeholder="Search purchase bill #, supplier..."
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

      {/* Purchases Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill #</th>
              <th>Supplier</th>
              <th>Items</th>
              <th style={{ textAlign: 'right' }}>Total Bill</th>
              <th style={{ textAlign: 'right' }}>Paid (Out)</th>
              <th style={{ textAlign: 'right' }}>Due (Udhaar)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Brother</th>
              <th style={{ textAlign: 'center' }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading purchase bills...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No purchase invoices found.</td></tr>
            ) : (
              purchases.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.825rem' }}>{p.invoiceNumber}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.supplierName}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.items?.length} item(s)
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(p.netAmount)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(p.paidAmount)}
                  </td>
                  <td style={{ textAlign: 'right', color: p.dueAmount > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(p.dueAmount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-success' : p.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <BrotherBadge name={p.createdByName} brotherIndex={p.brotherIndex} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-outline btn-icon btn-sm"
                      onClick={() => setSelectedPurchase(p)}
                      title="View Bill Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onSuccess={() => { triggerRefresh(); loadPurchases(); }}
      />

      {/* View Detail Modal */}
      {selectedPurchase && (
        <Modal isOpen={!!selectedPurchase} onClose={() => setSelectedPurchase(null)} title={`Purchase Bill #${selectedPurchase.invoiceNumber}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Purchased By:</span>
                <div><BrotherBadge name={selectedPurchase.createdByName} brotherIndex={selectedPurchase.brotherIndex} /></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date:</span>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(selectedPurchase.date).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier:</span>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedPurchase.supplierName}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Line Items:</span>
              <table className="custom-table" style={{ marginTop: '0.25rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchase.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Bill:</span>
                <div style={{ fontWeight: 800 }}>{formatCurrency(selectedPurchase.netAmount)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Paid:</span>
                <div style={{ fontWeight: 800, color: '#ef4444' }}>{formatCurrency(selectedPurchase.paidAmount)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Payable:</span>
                <div style={{ fontWeight: 800, color: '#ef4444' }}>{formatCurrency(selectedPurchase.dueAmount)}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Purchases;
