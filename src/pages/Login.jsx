import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleQuickBrotherLogin = async (bNum) => {
    const emailToUse = `brother${bNum}@business.com`;
    setEmail(emailToUse);
    setPassword('password123');

    setLoading(true);
    setError('');
    try {
      await login(emailToUse, 'password123');
      navigate('/');
    } catch (err) {
      // Fallback try original test email if existing
      try {
        const altEmail = bNum === 1 ? 'ahmed@khanbrothers.com' : bNum === 2 ? 'bilal@khanbrothers.com' : 'hamza@khanbrothers.com';
        await login(altEmail, 'brother123');
        navigate('/');
      } catch (altErr) {
        setLoading(false);
        setError('Login failed. Please enter your email and password or register a new workspace.');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
          }}>
            HK
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hisab-Kitab Ledger</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Multi-User Joint Business & Inventory Management
          </p>
        </div>

        {/* 1-Click Quick Brother Demo Login Bar */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserCheck size={14} color="#10b981" /> 1-Click Brother Login:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#065f46', borderColor: '#10b981', fontSize: '0.75rem' }}
              onClick={() => handleQuickBrotherLogin(1)}
            >
              Brother 1
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#1e40af', borderColor: '#3b82f6', fontSize: '0.75rem' }}
              onClick={() => handleQuickBrotherLogin(2)}
            >
              Brother 2
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#5b21b6', borderColor: '#8b5cf6', fontSize: '0.75rem' }}
              onClick={() => handleQuickBrotherLogin(3)}
            >
              Brother 3
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. brother1@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In to Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have a workspace account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Register New Business
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
