'use client';

import React, { useState, useEffect } from 'react';

interface DealCountdownProps {
  targetDate: string | Date;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function DealCountdown({ targetDate, onExpire }: DealCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (expired) {
    return (
      <span style={{ fontSize: '13px', color: '#ff1744', fontWeight: 600 }}>Expired</span>
    );
  }

  const units = [
    { label: 'D', value: timeLeft.days },
    { label: 'H', value: timeLeft.hours },
    { label: 'M', value: timeLeft.minutes },
    { label: 'S', value: timeLeft.seconds },
  ];

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '16px',
                fontWeight: 800,
                color: '#fff',
                minWidth: '40px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
