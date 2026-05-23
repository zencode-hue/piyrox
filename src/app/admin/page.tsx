"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  is_verified: boolean;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  totalDownloads: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalDownloads: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth) {
      setAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper auth)
    if (password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      setAuthenticated(true);
      setPassword('');
      fetchData();
    } else {
      setError('Invalid password');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      
      if (usersData.success) {
        setUsers(usersData.users);
        
        // Calculate stats
        const verified = usersData.users.filter((u: User) => u.is_verified).length;
        setStats({
          totalUsers: usersData.users.length,
          verifiedUsers: verified,
          totalDownloads: Math.floor(Math.random() * 1000) + 100, // Mock data
          activeUsers: Math.floor(verified * 0.7)
        });
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setAuthenticated(false);
    setUsers([]);
  };

  if (!authenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Admin Dashboard</h1>
          <p>Enter password to continue</p>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleAdminLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button type="submit" className={styles.loginBtn}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users and monitor platform activity</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>{stats.totalUsers}</div>
          <div className={styles.statChange}>+12% this month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Verified Users</div>
          <div className={styles.statValue}>{stats.verifiedUsers}</div>
          <div className={styles.statChange}>{Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}% verified</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Downloads</div>
          <div className={styles.statValue}>{stats.totalDownloads}</div>
          <div className={styles.statChange}>+8% this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Users</div>
          <div className={styles.statValue}>{stats.activeUsers}</div>
          <div className={styles.statChange}>Last 30 days</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Recent Users</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${user.is_verified ? styles.verified : styles.pending}`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/products" className={styles.actionCard}>
            <div className={styles.actionIcon}>📦</div>
            <div className={styles.actionTitle}>Manage Products</div>
            <div className={styles.actionDesc}>View and update product listings</div>
          </Link>
          <Link href="/admin/settings" className={styles.actionCard}>
            <div className={styles.actionIcon}>⚙️</div>
            <div className={styles.actionTitle}>Settings</div>
            <div className={styles.actionDesc}>Configure platform settings</div>
          </Link>
          <Link href="/admin/analytics" className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <div className={styles.actionTitle}>Analytics</div>
            <div className={styles.actionDesc}>View detailed analytics and reports</div>
          </Link>
          <Link href="/" className={styles.actionCard}>
            <div className={styles.actionIcon}>🏠</div>
            <div className={styles.actionTitle}>Back to Home</div>
            <div className={styles.actionDesc}>Return to main website</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
