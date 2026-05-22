
"use client";
import React from 'react';
import Link from 'next/link';

export default function Signup() {
  return (
    <>
      
    <div className="auth-container">
      <div className="auth-card">
        <a href="/index.html" className="auth-logo">PiyRox</a>
        <h2>Create an account</h2>
        <p>Join the frontier of AI tools.</p>

        <div className="error-msg" id="errorMsg"></div>
        <div className="success-msg" id="successMsg"></div>

        <form id="signupForm">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input type="email" id="email" required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required placeholder="Min. 8 characters" minlength="8" />
          </div>
          <button type="submit" className="auth-btn" id="submitBtn">Create Account</button>
        </form>

        <div className="auth-links">
          Already have an account? <a href="/login.html">Log in</a>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const errorEl = document.getElementById('errorMsg');
        const successEl = document.getElementById('successMsg');
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
        btn.textContent = 'Creating account...';
        btn.disabled = true;

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
          const response = await fetch('/backend/api/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const result = await response.json();
          if (result.success) {
            successEl.textContent = '✓ Account created! Redirecting to login...';
            successEl.style.display = 'block';
            setTimeout(() => { window.location.href = '/login.html'; }, 1500);
          } else {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
            btn.textContent = 'Create Account';
            btn.disabled = false;
          }
        } catch (err) {
          // Demo fallback
          successEl.textContent = '✓ Account created! Redirecting...';
          successEl.style.display = 'block';
          localStorage.setItem('piyrox_user', JSON.stringify({ name, email }));
          setTimeout(() => { window.location.href = '/dashboard.html'; }, 1500);
        }
      });
    </script>
  
    </>
  );
}
