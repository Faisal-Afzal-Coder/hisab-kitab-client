import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Package,
  History,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Eye,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DateFilter from '../components/common/DateFilter';
import BrotherBadge from '../components/common/BrotherBadge';
import QuickReceiveModal from '../components/forms/QuickReceiveModal';
import QuickPayModal from '../components/forms/QuickPayModal';
import SaleModal from '../components/forms/SaleModal';
import TransactionModal from '../components/forms/TransactionModal';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { formatCurrency, refreshKey, triggerRefresh } = useBusiness();

  const [datePreset, setDatePreset] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [datePreset, startDate, endDate, refreshKey]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      let url = `/dashboard?datePreset=${datePreset}`;
      if (datePreset === 'custom') {
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setDashboardData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const kpis = dashboardData?.kpis || {};
  const accounts = dashboardData?.accounts || [];
  const recentTransactions = dashboardData?.recentTransactions || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const lowStockItems = dashboardData?.lowStockItems || [];

  return (
    <div className="page-container">
      {/* Top Welcome & Quick Action Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Business Dashboard</span>
          </h1>
          <div className="page-subtitle">
            Joint financial overview & stock summary for the 3 Brothers
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={() => setReceiveModalOpen(true)}>
            <ArrowDownLeft size={16} /> + Wusooli (Receive)
          </button>
          <button className="btn btn-danger" onClick={() => setPayModalOpen(true)}>
            <ArrowUpRight size={16} /> - Adaigi (Pay)
          </button>
          <button className="btn btn-primary" onClick={() => setSaleModalOpen(true)}>
            <ShoppingBag size={16} /> + Sale Bill
          </button>
          <button className="btn btn-secondary" onClick={() => setTxnModalOpen(true)}>
            <PlusCircle size={16} /> + Expense / Other
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <DateFilter
        selectedPreset={datePreset}
        onPresetChange={(preset) => {
          setDatePreset(preset);
          if (preset !== 'custom') {
            setStartDate('');
            setEndDate('');
          }
        }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Primary KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Net Available Cash & Bank"
          value={kpis.totalAvailableBalance || 0}
          variant="success"
          icon={Wallet}
          subtitle="Total liquid business funds"
        />
        <StatCard
          title="Lene Hain (Receivables)"
          value={kpis.totalReceivables || 0}
          variant="receivable"
          icon={ArrowDownLeft}
          subtitle={`${kpis.countReceivableParties || 0} Customers owe money`}
        />
        <StatCard
          title="Dene Hain (Payables)"
          value={kpis.totalPayables || 0}
          variant="payable"
          icon={ArrowUpRight}
          subtitle={`Owed to ${kpis.countPayableParties || 0} Suppliers`}
        />
        <StatCard
          title="Inventory Stock Value"
          value={kpis.totalInventoryValue || 0}
          variant="purple"
          icon={Package}
          subtitle={`${kpis.totalInventoryItems || 0} Total stock items`}
        />
      </div>

      {/* Period Performance Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard
          title="Period Sales"
          value={kpis.periodSales || 0}
          variant="default"
          icon={ShoppingBag}
        />
        <StatCard
          title="Period Purchases"
          value={kpis.periodPurchases || 0}
          variant="default"
          icon={ShoppingCart}
        />
        <StatCard
          title="Period Expenses"
          value={kpis.periodExpenses || 0}
          variant="warning"
          icon={Receipt}
        />
        <StatCard
          title="Period Money In (Wusool)"
          value={kpis.periodMoneyReceived || 0}
          variant="success"
          icon={TrendingUp}
        />
        <StatCard
          title="Period Money Out (Ada)"
          value={kpis.periodMoneyPaid || 0}
          variant="payable"
          icon={ArrowUpRight}
        />
      </div>

      {/* Low Stock Warning Alert if any */}
      {kpis.lowStockCount > 0 && (
        <div style={{
          backgroundColor: 'var(--warning-bg)',
          color: 'var(--warning-text)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Low Stock Alert: {kpis.lowStockCount} product(s) are running below the minimum reorder level!
            </span>
          </div>
          <Link to="/inventory" className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>
            View Stock & Reorder
          </Link>
        </div>
      )}

      {/* Main 2-Column Section: Accounts & Recent Transactions vs Brother Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: Accounts & Recent Ledger Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Accounts Breakdown Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} color="var(--primary)" /> Cash & Bank Balances
              </h3>
              <Link to="/accounts" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Manage Accounts &rarr;
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {acc.name}
                  </div>
                  <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {formatCurrency(acc.currentBalance)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {acc.type.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Ledger Transactions</h3>
              <Link to="/ledger" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                View Full Hisab &rarr;
              </Link>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Trx / Party</th>
                    <th>Brother</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No transactions recorded yet
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((t) => (
                      <tr key={t._id}>
                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.partyName || t.description}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {t.transactionNumber} • {t.type.replace('_', ' ').toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <BrotherBadge name={t.createdByName} brotherIndex={t.brotherIndex} avatarColor={t.avatarColor} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {t.moneyIn > 0 ? (
                            <span className="money-in">+{formatCurrency(t.moneyIn)}</span>
                          ) : t.moneyOut > 0 ? (
                            <span className="money-out">-{formatCurrency(t.moneyOut)}</span>
                          ) : (
                            <span className="amount-font">{formatCurrency(t.amount)}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-outline btn-icon btn-sm"
                            onClick={() => setSelectedTxn(t)}
                            title="View Transaction"
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
          </div>
        </div>

        {/* Right Column: Live Brother Activity Audit Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} color="var(--primary)" /> 3 Brothers Activity Log
              </h3>
              <Link to="/activity" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Full Audit Trail &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
              {recentActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No brother activity logged yet
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act._id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: act.avatarColor || 'var(--primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      B{act.brotherIndex || 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>Module: {act.module}</span>
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={`Transaction #${selectedTxn.transactionNumber}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded By:</span>
                <div><BrotherBadge name={selectedTxn.createdByName} brotherIndex={selectedTxn.brotherIndex} /></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Time:</span>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(selectedTxn.date).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type:</span>
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedTxn.type.replace('_', ' ')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount:</span>
                <div className="amount-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedTxn.moneyIn > 0 ? '#10b981' : selectedTxn.moneyOut > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                  {formatCurrency(selectedTxn.amount)}
                </div>
              </div>
            </div>

            {selectedTxn.partyName && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Party:</span>
                <div style={{ fontWeight: 700 }}>{selectedTxn.partyName}</div>
              </div>
            )}

            {selectedTxn.accountName && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.accountName}</div>
              </div>
            )}

            {selectedTxn.description && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description / Notes:</span>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  {selectedTxn.description}
                </div>
              </div>
            )}

            {selectedTxn.items && selectedTxn.items.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Items:</span>
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
                    {selectedTxn.items.map((item, i) => (
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
            )}
          </div>
        </Modal>
      )}

      {/* Quick Action Modals */}
      <QuickReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadDashboard();
        }}
      />

      <QuickPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadDashboard();
        }}
      />

      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadDashboard();
        }}
      />

      <TransactionModal
        isOpen={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          loadDashboard();
        }}
      />
    </div>
  );
};

export default Dashboard;
