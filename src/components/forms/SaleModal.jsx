import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import Modal from '../common/Modal';
import BrotherBadge from '../common/BrotherBadge';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import api from '../../services/api';

const SaleModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { formatCurrency } = useBusiness();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      loadData();
      setCustomerId('');
      setDiscount('0');
      setPaidAmount('0');
      setNotes('');
      setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [cRes, pRes, aRes] = await Promise.all([
        api.get('/parties?type=customer'),
        api.get('/products'),
        api.get('/accounts'),
      ]);
      setCustomers(cRes.data.parties || []);
      setProducts(pRes.data.products || []);
      setAccounts(aRes.data.accounts || []);

      const defaultAcc = aRes.data.accounts?.find((a) => a.isDefault) || aRes.data.accounts?.[0];
      if (defaultAcc) setAccountId(defaultAcc._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSelect = (index, prodId) => {
    const prod = products.find((p) => p._id === prodId);
    const newItems = [...items];
    if (prod) {
      newItems[index] = {
        productId: prod._id,
        productName: prod.name,
        unit: prod.unit,
        quantity: newItems[index].quantity || 1,
        unitPrice: prod.salePrice || 0,
        total: (newItems[index].quantity || 1) * (prod.salePrice || 0),
        availableStock: prod.currentStock,
      };
    } else {
      newItems[index] = { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 };
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    const numQty = Number(qty) || 0;
    newItems[index].quantity = numQty;
    newItems[index].total = numQty * (newItems[index].unitPrice || 0);
    setItems(newItems);
  };

  const handlePriceChange = (index, price) => {
    const newItems = [...items];
    const numPrice = Number(price) || 0;
    newItems[index].unitPrice = numPrice;
    newItems[index].total = (newItems[index].quantity || 0) * numPrice;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const netAmount = Math.max(0, subtotal - (Number(discount) || 0));
  const numPaid = Number(paidAmount) || 0;
  const dueAmount = Math.max(0, netAmount - numPaid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one product with quantity > 0');
      return;
    }
    if (numPaid > 0 && !accountId) {
      setError('Please select an account for the received amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/sales', {
        customerId,
        items: validItems,
        discount: Number(discount) || 0,
        paidAmount: numPaid,
        accountId: numPaid > 0 ? accountId : null,
        date,
        notes,
      });

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create sale invoice');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sale Invoice / POS Bill" size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Brother Attribution Header */}
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Sales Incharge:</span>
          <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
        </div>

        {/* Customer & Date Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Customer *</label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (Current Balance: {formatCurrency(c.currentBalance)})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Invoice Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Item Rows Table */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Items / Products</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItemRow}>
              <Plus size={14} /> Add Item Row
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Product</th>
                  <th style={{ width: '18%' }}>Quantity</th>
                  <th style={{ width: '20%' }}>Unit Price</th>
                  <th style={{ width: '17%' }}>Total (Rs.)</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        value={item.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Stock: {p.currentStock} {p.unit})
                          </option>
                        ))}
                      </select>
                      {item.availableStock !== undefined && item.availableStock < item.quantity && (
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>
                          Warning: Available stock is {item.availableStock}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control amount-font"
                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        min="0.01"
                        step="any"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control amount-font"
                        style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        min="0"
                        step="any"
                        required
                      />
                    </td>
                    <td className="amount-font" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {formatCurrency(item.total)}
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline btn-icon btn-sm"
                          style={{ color: '#ef4444' }}
                          onClick={() => removeItemRow(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Payments Calculation Box */}
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
            <div>
              <label className="form-label">Subtotal</label>
              <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {formatCurrency(subtotal)}
              </div>
            </div>

            <div>
              <label className="form-label">Discount (Rs.)</label>
              <input
                type="number"
                className="form-control amount-font"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="form-label">Net Bill Amount</label>
              <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(netAmount)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Paid Cash (Rs.)</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setPaidAmount(netAmount)}
                >
                  Full Paid
                </button>
              </div>
              <input
                type="number"
                className="form-control amount-font"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="form-label">Balance Due (Udhaar)</label>
              <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: dueAmount > 0 ? '#ef4444' : '#10b981' }}>
                {formatCurrency(dueAmount)}
              </div>
            </div>
          </div>

          {numPaid > 0 && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <label className="form-label">Deposit Received Cash/Bank Into Account *</label>
              <select
                className="form-select"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">-- Select Receiving Account --</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({formatCurrency(a.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Notes / Terms</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Delivered via Suzuki van / 15 days credit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating Bill...' : 'Generate & Save Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleModal;
