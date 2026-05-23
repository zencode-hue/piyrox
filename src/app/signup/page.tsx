"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Account created! Please check your email to verify your account.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Verification email sent! Check your inbox.');
      } else {
        setError(data.message || 'Failed to resend email. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link href="/" className="auth-logo">PiyRox</Link>
        <h2>Create an account</h2>
        <p>Join the frontier of AI tools.</p>

        {error && <div className="error-msg" style={{ display: 'block' }}>{error}</div>}
        {success && <div className="success-msg" style={{ display: 'block' }}>{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text" id="name" required placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email" id="email" required placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password" id="password" required
                placeholder="Min. 8 characters" minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {success && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
              Didn't receive the email?
            </p>
            <button 
              onClick={handleResend}
              disabled={resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}

        <div className="auth-links">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
