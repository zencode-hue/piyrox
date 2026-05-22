
"use client";
import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/dashboard.html" className="active">Dashboard</a>
          <a href="/products.html">Products</a>
          <a href="/download.html">Download</a>
        </div>
        <div className="nav-actions">
          <a href="/index.html" className="btn btn-secondary" id="logoutBtn">Log out</a>
        </div>
      </div>
    </nav>

    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-section">
          <h4>General</h4>
          <a href="/dashboard.html" className="sidebar-link active">📊 Overview</a>
          <a href="#" className="sidebar-link">🤖 Jarvis Sessions</a>
          <a href="#" className="sidebar-link">💻 IDE Projects</a>
          <a href="#" className="sidebar-link">💬 Chat History</a>
        </div>
        <div className="sidebar-section">
          <h4>Account</h4>
          <a href="#" className="sidebar-link">👤 Profile</a>
          <a href="#" className="sidebar-link">🔑 API Keys</a>
          <a href="/pricing.html" className="sidebar-link">💳 Billing</a>
          <a href="/contact.html" className="sidebar-link">✉️ Support</a>
        </div>
        <div className="sidebar-section">
          <h4>Downloads</h4>
          <a href="/download.html" className="sidebar-link">⬇️ Get Desktop Apps</a>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dash-header">
          <h1>Welcome back</h1>
          <p>Here's an overview of your PiyRox account and usage.</p>
        </div>

        <div className="plan-card">
          <div className="plan-info">
            <h3>Current Plan: <span id="userPlan">Basic (Free)</span></h3>
            <p>Upgrade to Pro for unlimited agentic coding and full Jarvis capabilities.</p>
          </div>
          <a href="/pricing.html" className="btn btn-primary">Upgrade Plan</a>
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

        <h3 style={{marginBottom: '8px'}}>API Key</h3>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px'}}>Use this key to authenticate with the PiyRox SDK.</p>
        <div className="api-key-box">
          <span id="apiKeyDisplay">pyx_sk_••••••••••••••••••••••••</span>
          <button onClick="this.textContent = this.textContent === 'Copy' ? 'Copied!' : 'Copy'; navigator.clipboard.writeText('pyx_sk_live_a1b2c3d4e5f6g7h8i9j0');">Copy</button>
        </div>

        <h3 style={{marginTop: '40px', marginBottom: '16px'}}>Recent Activity</h3>
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
      </main>
    </div>

    <script>
      // Redirect to login if not authenticated
      const user = localStorage.getItem('piyrox_user');
      if (!user) {
        window.location.href = '/login.html';
      } else {
        const userData = JSON.parse(user);
        document.querySelector('.dash-header h1').textContent = 'Welcome back, ' + userData.name;
      }
      document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('piyrox_user');
        window.location.href = '/index.html';
      });
    </script>
  
    </>
  );
}
