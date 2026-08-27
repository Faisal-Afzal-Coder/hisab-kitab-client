import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import BrotherBadge from '../common/BrotherBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StockAdjustModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { user } = useAuth();
  const [adjustedQuantity, setAdjustedQuantity] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setAdjustedQuantity('');
      setAdjustmentType('add');
      setReason('');
    }
  }, [isOpen]);

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(adjustedQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please provide a valid quantity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/products/${product._id}/adjust-stock`, {
        adjustedQuantity: qty,
        adjustmentType,
        reason,
      });

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock: ${product.name}`}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Current Stock: <strong>{product.currentStock} {product.unit}</strong></span>
          <BrotherBadge name={user?.name} brotherIndex={user?.brotherIndex} />
        </div>

        <div className="form-group">
          <label className="form-label">Adjustment Type *</label>
          <select
            className="form-select"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}
          >
            <option value="add">Add Stock (+ Stock In / Return)</option>
            <option value="subtract">Subtract Stock (- Damage / Loss / Expired)</option>
            <option value="set">Set Exact Count (Physical Audit Count)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity ({product.unit}) *</label>
          <input
            type="number"
            className="form-control amount-font"
            placeholder="0"
            value={adjustedQuantity}
            onChange={(e) => setAdjustedQuantity(e.target.value)}
            min="0.01"
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason / Audit Note *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Physical inventory count correction / Damaged bags"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustModal;
