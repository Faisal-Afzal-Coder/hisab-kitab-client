import React, { useState, useEffect } from 'react';
import { Package, PlusCircle, Search, AlertTriangle, Edit2, Sliders } from 'lucide-react';
import ProductModal from '../components/forms/ProductModal';
import StockAdjustModal from '../components/forms/StockAdjustModal';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Inventory = () => {
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, totalStockItems: 0, totalStockValue: 0, lowStockCount: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [search, category, lowStockOnly, refreshKey]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?category=${category}&lowStockOnly=${lowStockOnly}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setProducts(res.data.products || []);
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
            <Package size={26} color="var(--primary)" /> Inventory & Stock Management
          </h1>
          <div className="page-subtitle">
            Track real-time stock levels, purchase costs, sales prices, stock valuation, and reorder warnings
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditProduct(null);
            setProductModalOpen(true);
          }}
        >
          <PlusCircle size={16} /> + Add New Product
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card purple">
          <div>
            <div className="stat-label">Total Stock Valuation</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>
              {formatCurrency(summary.totalStockValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Valuation at purchase cost</div>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Stock Quantity</div>
            <div className="stat-value">
              {summary.totalStockItems || 0} Units
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across {summary.totalProducts || 0} catalog items</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value" style={{ color: summary.lowStockCount > 0 ? '#f59e0b' : '#10b981' }}>
              {summary.lowStockCount || 0} Items
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Below reorder threshold</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search product name, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Grains">Grains & Rice</option>
              <option value="Edible Oils">Edible Oils</option>
              <option value="Commodities">Commodities</option>
              <option value="Beverages">Beverages</option>
              <option value="General">General</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Show Low Stock Items Only
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU Code</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Cost Price</th>
              <th style={{ textAlign: 'right' }}>Sale Price</th>
              <th style={{ textAlign: 'center' }}>Current Stock</th>
              <th style={{ textAlign: 'right' }}>Total Value</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Loading inventory...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No products found.</td></tr>
            ) : (
              products.map((p) => {
                const isLow = p.currentStock <= p.minStockAlert;
                const value = p.currentStock * p.purchasePrice;

                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{p.description}</div>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.code || '-'}</td>
                    <td><span className="badge badge-secondary">{p.category}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.purchasePrice)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(p.salePrice)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="amount-font" style={{ fontSize: '1.05rem', fontWeight: 800, color: isLow ? '#ef4444' : 'var(--text-primary)' }}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(value)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isLow ? (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={11} /> LOW STOCK
                        </span>
                      ) : (
                        <span className="badge badge-success">IN STOCK</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-outline btn-icon btn-sm"
                          onClick={() => {
                            setSelectedProductForAdjust(p);
                            setAdjustModalOpen(true);
                          }}
                          title="Adjust Stock (+/-)"
                        >
                          <Sliders size={13} />
                        </button>
                        <button
                          className="btn btn-outline btn-icon btn-sm"
                          onClick={() => {
                            setEditProduct(p);
                            setProductModalOpen(true);
                          }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={editProduct}
        onSuccess={() => { triggerRefresh(); loadProducts(); }}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={selectedProductForAdjust}
        onSuccess={() => { triggerRefresh(); loadProducts(); }}
      />
    </div>
  );
};

export default Inventory;
