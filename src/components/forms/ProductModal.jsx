import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const ProductModal = ({ isOpen, onClose, product = null, onSuccess }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('General');
  const [unit, setUnit] = useState('pcs');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (product) {
        setName(product.name || '');
        setCode(product.code || '');
        setCategory(product.category || 'General');
        setUnit(product.unit || 'pcs');
        setPurchasePrice(product.purchasePrice || '');
        setSalePrice(product.salePrice || '');
        setOpeningStock(product.currentStock || '');
        setMinStockAlert(product.minStockAlert || '5');
        setDescription(product.description || '');
      } else {
        setName('');
        setCode('');
        setCategory('General');
        setUnit('pcs');
        setPurchasePrice('');
        setSalePrice('');
        setOpeningStock('0');
        setMinStockAlert('5');
        setDescription('');
      }
    }
  }, [isOpen, product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide product name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (product) {
        await api.put(`/products/${product._id}`, {
          name,
          code,
          category,
          unit,
          purchasePrice: Number(purchasePrice),
          salePrice: Number(salePrice),
          minStockAlert: Number(minStockAlert),
          description,
        });
      } else {
        await api.post('/products', {
          name,
          code,
          category,
          unit,
          purchasePrice: Number(purchasePrice),
          salePrice: Number(salePrice),
          openingStock: Number(openingStock) || 0,
          minStockAlert: Number(minStockAlert),
          description,
        });
      }

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? `Edit Product: ${product.name}` : 'Add New Inventory Item'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Product / Item Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Super Basmati Rice (25kg)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">SKU / Item Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. RICE-25"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grains / Oils / Spices"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Unit of Measure</label>
            <select
              className="form-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="bags">Bags (bori)</option>
              <option value="tins">Tins / Cans</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="boxes">Boxes / Cartons</option>
              <option value="packs">Packs</option>
              <option value="liters">Liters</option>
              <option value="meters">Meters</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Price (Cost) *</label>
            <input
              type="number"
              className="form-control amount-font"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              min="0"
              step="any"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Selling Price *</label>
            <input
              type="number"
              className="form-control amount-font"
              placeholder="0.00"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              min="0"
              step="any"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {!product && (
            <div className="form-group">
              <label className="form-label">Initial Opening Stock</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                min="0"
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Low Stock Alert Quantity</label>
            <input
              type="number"
              className="form-control"
              placeholder="5"
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
