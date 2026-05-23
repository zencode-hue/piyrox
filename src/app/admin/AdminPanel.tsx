'use client';

import { useState } from 'react';
import Link from 'next/link';

type AdminTab = 'analytics' | 'database' | 'settings';

interface AdminPanelProps {
  initialTab?: AdminTab;
}

export default function AdminPanel({ initialTab = 'analytics' }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [saveLabel, setSaveLabel] = useState('Save Changes');

  const handleSave = () => {
    setSaveLabel('Saved!');
    setTimeout(() => setSaveLabel('Save Changes'), 2000);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">PiyRox Admin</div>
        <nav className="admin-nav">
          <div
            className={`admin-link${activeTab === 'analytics' ? ' active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </div>
          <div
            className={`admin-link${activeTab === 'database' ? ' active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            🗄️ Database
          </div>
          <div
            className={`admin-link${activeTab === 'settings' ? ' active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ AI API Settings
          </div>
          <Link href="/" className="admin-link" style={{ marginTop: 'auto' }}>
            🚪 Exit Admin
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        {/* Analytics Tab */}
        <div className={`tab-content${activeTab === 'analytics' ? ' active' : ''}`}>
          <div className="admin-header">
            <h1>Platform Analytics</h1>
            <button className="btn btn-secondary">Export Report</button>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Users</h3>
              <div className="value">14,205</div>
              <div className="trend">+124 this week</div>
            </div>
            <div className="metric-card">
              <h3>Pro Subscribers</h3>
              <div className="value">2,840</div>
              <div className="trend">+45 this week</div>
            </div>
            <div className="metric-card">
              <h3>API Calls (24h)</h3>
              <div className="value">1.2M</div>
              <div className="trend">+8.4% today</div>
            </div>
            <div className="metric-card">
              <h3>MRR</h3>
              <div className="value">$56.8k</div>
              <div className="trend">+1.2% this month</div>
            </div>
          </div>
          <div className="chart-placeholder">
            <span>Live token usage chart rendering engine...</span>
          </div>
        </div>

        {/* Database Tab */}
        <div className={`tab-content${activeTab === 'database' ? ' active' : ''}`}>
          <div className="admin-header">
            <h1>Users Database</h1>
          </div>
          <div className="table-container">
            <table className="db-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10492</td>
                  <td>Sarah Connor</td>
                  <td>sarah@cyberdyne.com</td>
                  <td><span className="badge pro">Pro</span></td>
                  <td>Oct 24, 2026</td>
                  <td><button style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>Edit</button></td>
                </tr>
                <tr>
                  <td>10491</td>
                  <td>John Doe</td>
                  <td>john.doe@example.com</td>
                  <td><span className="badge free">Free</span></td>
                  <td>Oct 23, 2026</td>
                  <td><button style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>Edit</button></td>
                </tr>
                <tr>
                  <td>10490</td>
                  <td>Alice Vance</td>
                  <td>alice@vance.io</td>
                  <td><span className="badge pro">Pro</span></td>
                  <td>Oct 23, 2026</td>
                  <td><button style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings Tab */}
        <div className={`tab-content${activeTab === 'settings' ? ' active' : ''}`}>
          <div className="admin-header">
            <h1>Lab Settings</h1>
            <button className="btn btn-primary" onClick={handleSave}>{saveLabel}</button>
          </div>

          <div className="settings-card">
            <h2>Frontier Model API Keys</h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '24px' }}>
              Manage the upstream API keys used by the PiyRox Lab ecosystem.
            </p>
            <div className="setting-group">
              <label>OpenAI API Key (GPT-4o routing)</label>
              <input type="password" defaultValue="sk-proj-................................" />
            </div>
            <div className="setting-group">
              <label>Anthropic API Key (Claude 3.5 routing)</label>
              <input type="password" defaultValue="sk-ant-................................" />
            </div>
            <div className="setting-group">
              <label>Google Gemini API Key</label>
              <input type="password" defaultValue="AIzaSy................................" />
            </div>
            <div className="setting-group">
              <label>Together AI Key (Open-source fallback)</label>
              <input type="password" placeholder="Enter key..." />
            </div>
          </div>

          <div className="settings-card">
            <h2>System Toggles</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Allow New Registrations</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Users can sign up via the homepage</div>
              </div>
              <div style={{ background: '#ededed', width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, background: '#000', borderRadius: '50%', position: 'absolute', top: 2, right: 2 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Display maintenance page to all non-admins</div>
              </div>
              <div style={{ background: '#27272a', width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, background: '#a1a1aa', borderRadius: '50%', position: 'absolute', top: 2, left: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
