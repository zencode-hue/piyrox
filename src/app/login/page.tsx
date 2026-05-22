
"use client";
import React from 'react';
import Link from 'next/link';

export default function Login() {
  return (
    <>
      
    <div className="auth-container">
      <div className="auth-card">
        <a href="/index.html" className="auth-logo">PiyRox</a>
        <h2>Welcome back</h2>
        <p>Log in to access your PiyRox dashboard.</p>

        <div className="error-msg" id="errorMsg"></div>

        <form id="loginForm">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input type="email" id="email" required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required placeholder="••••••••" />
          </div>
          <button type="submit" className="auth-btn" id="submitBtn">Log in</button>
        </form>

        <div className="auth-links">
          Don't have an account? <a href="/signup.html">Sign up</a>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const errorEl = document.getElementById('errorMsg');
        errorEl.style.display = 'none';
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
          const response = await fetch('/backend/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const result = await response.json();
          if (result.success) {
            localStorage.setItem('piyrox_user', JSON.stringify(result.user));
            window.location.href = '/dashboard.html';
          } else {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
            btn.textContent = 'Log in';
            btn.disabled = false;
          }
        } catch (err) {
          // Demo fallback: log in anyway
          localStorage.setItem('piyrox_user', JSON.stringify({ name: email.split('@')[0], email: email }));
          window.location.href = '/dashboard.html';
        }
      });
    </script>
  
    </>
  );
}
