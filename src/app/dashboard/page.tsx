"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText('pyx_sk_live_a1b2c3d4e5f6g7h8i9j0');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar activePage="dashboard" />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h4>General</h4>
            <Link href="/dashboard" className="sidebar-link active">📊 Overview</Link>
            <a href="#" className="sidebar-link">🤖 Jarvis Sessions</a>
            <a href="#" className="sidebar-link">💻 IDE Projects</a>
            <a href="#" className="sidebar-link">💬 Chat History</a>
          </div>
          <div className="sidebar-section">
            <h4>Account</h4>
            <a href="#" className="sidebar-link">👤 Profile</a>
            <a href="#" className="sidebar-link">🔑 API Keys</a>
            <Link href="/pricing" className="sidebar-link">💳 Billing</Link>
            <Link href="/contact" className="sidebar-link">✉️ Support</Link>
          </div>
          <div className="sidebar-section">
            <h4>Downloads</h4>
            <Link href="/download" className="sidebar-link">⬇️ Get Desktop Apps</Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dash-header">
            <h1>Welcome back{user ? `, ${user.name}` : ''}</h1>
            <p>Here&apos;s an overview of your PiyRox account and usage.</p>
          </div>

          <div className="plan-card">
            <div className="plan-info">
              <h3>Current Plan: <span style={{ color: 'var(--accent-blue)', textTransform: 'capitalize' }}>{user?.plan || 'Free'}</span></h3>
              <p>Upgrade to Pro for unlimited agentic coding and full Jarvis capabilities.</p>
            </div>
            <Link href="/pricing" className="btn btn-primary">Upgrade Plan</Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Chat Messages</div>
              <div className="stat-value">1,247</div>
              <div className="stat-change">↑ 12% this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">IDE Sessions</div>
              <div className="stat-value">84</div>
              <div className="stat-change">↑ 5% this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Jarvis Commands</div>
              <div className="stat-value">312</div>
              <div className="stat-change">↑ 24% this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">API Calls</div>
              <div className="stat-value">8,901</div>
              <div className="stat-change">↑ 8% this week</div>
            </div>
          </div>

          <h3 style={{ marginBottom: '8px' }}>API Key</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Use this key to authenticate with the PiyRox SDK.
          </p>
          <div className="api-key-box">
            <span style={{ fontFamily: 'monospace' }}>pyx_sk_••••••••••••••••••••••••</span>
            <button onClick={handleCopyKey}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>

          <h3 style={{ marginTop: '40px', marginBottom: '16px' }}>Recent Activity</h3>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Action</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PiyRox Chat</td>
                <td>Generated marketing copy</td>
                <td>2 minutes ago</td>
                <td><span className="badge badge-active">Complete</span></td>
              </tr>
              <tr>
                <td>PiyRox IDE</td>
                <td>Refactored auth module</td>
                <td>1 hour ago</td>
                <td><span className="badge badge-active">Complete</span></td>
              </tr>
              <tr>
                <td>Jarvis OS</td>
                <td>Scheduled system backup</td>
                <td>3 hours ago</td>
                <td><span className="badge badge-pending">Pending</span></td>
              </tr>
              <tr>
                <td>PiyRox Chat</td>
                <td>Analyzed sales dataset</td>
                <td>Yesterday</td>
                <td><span className="badge badge-active">Complete</span></td>
              </tr>
              <tr>
                <td>PiyRox IDE</td>
                <td>Built REST API endpoints</td>
                <td>2 days ago</td>
                <td><span className="badge badge-active">Complete</span></td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '40px' }}>
            <button className="btn btn-secondary" onClick={logout}>Log out</button>
          </div>
        </main>
      </div>
    </>
  );
}
