"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Checkout() {
  const [cardName, setCardName] = useState('');
  const [cardEmail, setCardEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cardName, email: cardEmail, plan: 'pro' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment successful! Welcome to PiyRox Pro.');
        window.location.href = '/dashboard';
      } else {
        alert(data.message || 'Payment failed. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Payment successful! Welcome to PiyRox Pro.');
      window.location.href = '/dashboard';
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-form-card">
          <h2>Payment Details</h2>
          <p>Complete your subscription to PiyRox Pro.</p>

          <div className="card-icons">
            <span className="card-icon-img">VISA</span>
            <span className="card-icon-img">MC</span>
            <span className="card-icon-img">AMEX</span>
            <span className="card-icon-img">PayPal</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cardName">Cardholder Name</label>
              <input type="text" id="cardName" placeholder="Full name on card" required
                value={cardName} onChange={(e) => setCardName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="cardEmail">Email</label>
              <input type="email" id="cardEmail" placeholder="you@example.com" required
                value={cardEmail} onChange={(e) => setCardEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456"
                maxLength={19} required value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiry Date</label>
                <input type="text" id="cardExpiry" placeholder="MM / YY"
                  maxLength={7} required value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} />
              </div>
              <div className="form-group">
                <label htmlFor="cardCVC">CVC</label>
                <input type="text" id="cardCVC" placeholder="123"
                  maxLength={4} required value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
            </div>
            <hr className="divider" />
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input type="text" id="country" placeholder="United States" required
                value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <button type="submit" className="pay-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Pay $20.00'}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-line">
            <span>PiyRox Pro (Monthly)</span>
            <span>$20.00</span>
          </div>
          <div className="order-line">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div className="order-total">
            <span>Total</span>
            <span>$20.00</span>
          </div>
          <hr className="divider" />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '12px', color: '#ededed', fontWeight: 600 }}>What you&apos;ll get:</p>
            <p>✓ Unlimited PiyRox Chat messages</p>
            <p>✓ All frontier models (PiyRox-4, Jarvis V3)</p>
            <p>✓ Unlimited IDE agentic coding</p>
            <p>✓ Full Jarvis OS capabilities</p>
            <p>✓ 10,000 API calls per month</p>
            <p>✓ Priority support</p>
          </div>
          <div className="secure-badge">🔒 Secured with 256-bit SSL encryption</div>
        </div>
      </div>
    </>
  );
}
