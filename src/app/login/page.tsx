"use client";
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const expired = searchParams.get('expired');
  const verified = searchParams.get('verified');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // Store user data in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(data.user));
        // Use window.location for more reliable redirect
        window.location.href = redirect;
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link href="/" className="auth-logo">PiyRox</Link>
        <h2>Welcome back</h2>
        <p>Log in to access your PiyRox dashboard.</p>

        {expired && (
          <div className="error-msg" style={{ display: 'block' }}>
            Your session expired. Please log in again.
          </div>
        )}
        {verified && (
          <div className="success-msg" style={{ display: 'block' }}>
            ✓ Email verified! You can now log in.
          </div>
        )}
        {error && (
          <div className="error-msg" style={{ display: 'block' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email" id="email" required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-links">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="auth-card"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
