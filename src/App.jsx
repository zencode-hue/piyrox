import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import IDEPage from './pages/IDEPage';
import PlanPage from './pages/PlanPage';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading PiyRox IDE...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        <Route path="/plans" element={user ? <PlanPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/ide" element={user ? <IDEPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? <Navigate to="/ide" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
