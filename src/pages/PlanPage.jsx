import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Plans.css';

export default function PlanPage({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const response = await fetch('http://localhost:5000/api/plans/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Plan upgraded successfully!');
        navigate('/ide');
      }
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading plans...</div>;
  }

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Current Plan: <strong>{user.plan}</strong></p>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className={`plan-card ${plan.id === user.plan ? 'current' : ''}`}>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price}<span>/month</span></div>
            
            <ul className="plan-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>

            {plan.id === user.plan ? (
              <button className="btn-current" disabled>Current Plan</button>
            ) : (
              <button 
                className="btn-upgrade"
                onClick={() => handleUpgrade(plan.id)}
              >
                Upgrade to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/ide')} className="btn-back">
        ← Back to IDE
      </button>
    </div>
  );
}
