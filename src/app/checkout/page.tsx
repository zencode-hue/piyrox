
"use client";
import React from 'react';
import Link from 'next/link';

export default function Checkout() {
  return (
    <>
      
    <nav className="navbar">
      <div className="nav-container">
        <a href="/index.html" className="logo">PiyRox</a>
        <div className="nav-links">
          <a href="/pricing.html">← Back to Pricing</a>
        </div>
        <div className="nav-actions"></div>
      </div>
    </nav>

    <div className="checkout-container">
      <div className="checkout-form-card">
        <h2>Payment Details</h2>
        <p>Complete your subscription to PiyRox Pro.</p>

        <div className="card-icons">
          <span className="card-icon-img">VISA</span>
          <span className="card-icon-img">Mastercard</span>
          <span className="card-icon-img">Amex</span>
          <span className="card-icon-img">PayPal</span>
        </div>

        <form id="checkoutForm">
          <div className="form-group">
            <label htmlFor="cardName">Cardholder Name</label>
            <input type="text" id="cardName" placeholder="Full name on card" required />
          </div>

          <div className="form-group">
            <label htmlFor="cardEmail">Email</label>
            <input type="email" id="cardEmail" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required
              oninput="this.value=this.value.replace(/[^\d]/g,'').replace(/(\d{4})/g,'$1 ').trim()" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardExpiry">Expiry Date</label>
              <input type="text" id="cardExpiry" placeholder="MM / YY" maxlength="7" required
                oninput="let v=this.value.replace(/[^\d]/g,'');if(v.length />=2)v=v.slice(0,2)+' / '+v.slice(2);this.value=v;">
            </div>
            <div className="form-group">
              <label htmlFor="cardCVC">CVC</label>
              <input type="text" id="cardCVC" placeholder="123" maxlength="4" required />
            </div>
          </div>

          <hr className="divider" />

          <div className="form-group">
            <label htmlFor="billingCountry">Country</label>
            <input type="text" id="billingCountry" placeholder="United States" required />
          </div>

          <button type="submit" className="pay-btn" id="payBtn">Pay $20.00</button>
        </form>
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="order-line">
          <span className="label">PiyRox Pro (Monthly)</span>
          <span>$20.00</span>
        </div>
        <div className="order-line">
          <span className="label">Tax</span>
          <span>$0.00</span>
        </div>
        <div className="order-total">
          <span>Total</span>
          <span>$20.00</span>
        </div>

        <hr className="divider" />

        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
          <p style={{marginBottom: '12px'}}><strong style={{color: '#ededed'}}>What you'll get:</strong></p>
          <p>✓ Unlimited PiyRox Chat messages</p>
          <p>✓ All frontier models (PiyRox-4, Jarvis V3)</p>
          <p>✓ Unlimited IDE agentic coding</p>
          <p>✓ Full Jarvis OS capabilities</p>
          <p>✓ 10,000 API calls per month</p>
          <p>✓ Priority support</p>
        </div>

        <div className="secure-badge">
          🔒 Secured with 256-bit SSL encryption
        </div>
      </div>
    </div>

    <script>
      document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('payBtn');
        btn.textContent = 'Processing...';
        btn.disabled = true;

        const paymentData = {
          name: document.getElementById('cardName').value,
          email: document.getElementById('cardEmail').value,
          plan: 'pro'
        };

        try {
          const res = await fetch('/backend/api/payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
          });
          const result = await res.json();
          if (result.success) {
            alert('✓ Payment successful! Welcome to PiyRox Pro.');
            window.location.href = '/dashboard.html';
          } else {
            alert(result.message || 'Payment failed. Please try again.');
            btn.textContent = 'Pay $20.00';
            btn.disabled = false;
          }
        } catch(err) {
          // Demo fallback
          setTimeout(() => {
            alert('✓ Payment successful! Welcome to PiyRox Pro.');
            localStorage.setItem('piyrox_plan', 'pro');
            window.location.href = '/dashboard.html';
          }, 1500);
        }
      });
    </script>
  
    </>
  );
}
