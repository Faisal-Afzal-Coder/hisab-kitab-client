import React, { useState, useEffect } from 'react';
import { FileBarChart, Printer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import DateFilter from '../components/common/DateFilter';
import { useBusiness } from '../context/BusinessContext';
import api from '../services/api';

const Reports = () => {
  const { formatCurrency } = useBusiness();

  const [activeTab, setActiveTab] = useState('pl'); // 'pl' (P&L) or 'daybook' (Roznamcha)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('thisMonth');

  const [plReport, setPlReport] = useState(null);
  const [daybookDate, setDaybookDate] = useState(new Date().toISOString().slice(0, 10));
  const [daybookData, setDaybookData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pl') {
      loadPLReport();
    } else {
      loadDaybook();
    }
  }, [activeTab, datePreset, startDate, endDate, daybookDate]);

  const loadPLReport = async () => {
    setLoading(true);
    try {
      let url = '/reports/profit-and-loss';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setPlReport(res.data.report || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadDaybook = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/daybook?date=${daybookDate}`);
      setDaybookData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileBarChart size={26} color="var(--primary)" /> Financial Reports & P&L Statement
          </h1>
          <div className="page-subtitle">
            Profit & Loss statements, Daybook Roznamcha, and business net earnings
          </div>
        </div>

        <button className="btn btn-outline" onClick={handlePrint}>
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'pl' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pl')}
        >
          Profit & Loss Statement (P&L)
        </button>
        <button
          className={`btn ${activeTab === 'daybook' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('daybook')}
        >
          Daily Daybook (Roznamcha)
        </button>
      </div>

      {activeTab === 'pl' && (
        <div>
          {/* P&L Statement Content */}
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Khan Brothers Joint Trading Co.</h2>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
                Profit & Loss Statement (Nafa Nuqsan Hisab)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Generated for the current financial cycle
              </div>
            </div>

            {loading || !plReport ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Calculating P&L...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Revenue Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', color: 'var(--primary)' }}>
                    <span>1. Sales Revenue (Gross Farokht)</span>
                    <span className="amount-font">{formatCurrency(plReport.totalSalesRevenue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ paddingLeft: '1rem' }}>Total Sales Invoices</span>
                    <span className="amount-font">{formatCurrency(plReport.totalSalesRevenue)}</span>
                  </div>
                </div>

                {/* 2. Cost of Purchases */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', color: '#ef4444' }}>
                    <span>2. Cost of Purchases (Kharidari)</span>
                    <span className="amount-font">-{formatCurrency(plReport.totalPurchases)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ paddingLeft: '1rem' }}>Total Purchase Invoices</span>
                    <span className="amount-font">-{formatCurrency(plReport.totalPurchases)}</span>
                  </div>
                </div>

                {/* Gross Profit */}
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
                  <span>Gross Trading Profit / Margin:</span>
                  <span className="amount-font" style={{ color: plReport.grossProfit >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(plReport.grossProfit)}
                  </span>
                </div>

                {/* 3. Direct Other Income */}
                {plReport.totalDirectIncome > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                      <span>3. Direct Other Income (Commission / Rental)</span>
                      <span className="amount-font">+{formatCurrency(plReport.totalDirectIncome)}</span>
                    </div>
                  </div>
                )}

                {/* 4. Operating Expenses */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', color: '#ef4444' }}>
                    <span>4. Business Operating Expenses (Kharchay)</span>
                    <span className="amount-font">-{formatCurrency(plReport.totalExpenses)}</span>
                  </div>
                  {Object.entries(plReport.expenseCategories || {}).map(([cat, amt]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ paddingLeft: '1rem' }}>{cat}</span>
                      <span className="amount-font">-{formatCurrency(amt)}</span>
                    </div>
                  ))}
                </div>

                {/* NET PROFIT */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: plReport.netProfit >= 0 ? 'var(--primary-light)' : 'var(--danger-bg)',
                  border: `2px solid ${plReport.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)'}`,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem',
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Net Joint Business Earnings (Khaalas Nafa / Nuqsan):
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Net profit shared jointly among the 3 Brothers
                    </div>
                  </div>
                  <div className="amount-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: plReport.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    {formatCurrency(plReport.netProfit)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'daybook' && (
        <div>
          {/* Daybook Content */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Select Daybook Date:</span>
              <input
                type="date"
                className="form-control"
                style={{ width: 'auto' }}
                value={daybookDate}
                onChange={(e) => setDaybookDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card success">
              <div>
                <div className="stat-label">Day Total Money In</div>
                <div className="stat-value" style={{ color: '#10b981' }}>
                  +{formatCurrency(daybookData?.totalMoneyIn || 0)}
                </div>
              </div>
            </div>

            <div className="stat-card payable">
              <div>
                <div className="stat-label">Day Total Money Out</div>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  -{formatCurrency(daybookData?.totalMoneyOut || 0)}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Day Net Cash Movement</div>
                <div className="stat-value" style={{ color: (daybookData?.netDayBalance || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatCurrency(daybookData?.netDayBalance || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Trx #</th>
                  <th>Type</th>
                  <th>Party / Purpose</th>
                  <th>Account</th>
                  <th style={{ textAlign: 'right' }}>In (+)</th>
                  <th style={{ textAlign: 'right' }}>Out (-)</th>
                  <th style={{ textAlign: 'center' }}>Brother</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading Daybook entries...</td></tr>
                ) : !daybookData?.transactions || daybookData.transactions.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No transactions on this date.</td></tr>
                ) : (
                  daybookData.transactions.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{t.transactionNumber}</td>
                      <td><span className="badge badge-secondary">{t.type.replace('_', ' ')}</span></td>
                      <td style={{ fontWeight: 600 }}>{t.partyName || t.description}</td>
                      <td>{t.accountName}</td>
                      <td style={{ textAlign: 'right' }}>{t.moneyIn > 0 ? <span className="money-in">+{formatCurrency(t.moneyIn)}</span> : '-'}</td>
                      <td style={{ textAlign: 'right' }}>{t.moneyOut > 0 ? <span className="money-out">-{formatCurrency(t.moneyOut)}</span> : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{t.createdByName?.split(' ')[0]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
