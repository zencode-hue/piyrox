"use client";

import React from 'react';
import { Zap, ShieldCheck, Users } from 'lucide-react';
import PiyroxLogo from '../PiyroxLogo';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,255,255,0.1)', marginBottom: '1rem' }}
      >
        <PiyroxLogo size={60} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Start Winning With<br/><span>PIYROX Market</span>
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Providing high-quality enhancement tools and digital subscriptions to elevate your experience, at competitive prices.
      </motion.p>
      
      <motion.div 
        className="feature-pills"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="feature-pill"><Zap size={16}/> Instant Delivery</div>
        <div className="feature-pill"><ShieldCheck size={16}/> Secure & Undetected</div>
        <div className="feature-pill"><Users size={16}/> 1000+ Customers</div>
      </motion.div>
    </div>
  );
}
