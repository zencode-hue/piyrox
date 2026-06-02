'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AnimatedSubtitleProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function AnimatedSubtitle({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
}: AnimatedSubtitleProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const tick = useCallback(() => {
    const currentText = texts[textIndex];

    if (!isDeleting) {
      setDisplayText(currentText.substring(0, charIndex + 1));
      setCharIndex((prev) => prev + 1);

      if (charIndex + 1 === currentText.length) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
        return;
      }
    } else {
      setDisplayText(currentText.substring(0, charIndex - 1));
      setCharIndex((prev) => prev - 1);

      if (charIndex - 1 === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }
    }
  }, [charIndex, isDeleting, textIndex, texts, pauseDuration]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(tick, speed);
    return () => clearTimeout(timeout);
  }, [tick, isDeleting, typingSpeed, deletingSpeed]);

  return (
    <span
      style={{
        fontSize: 'clamp(14px, 2vw, 18px)',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 400,
        display: 'inline',
      }}
    >
      {displayText}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.2em',
          background: 'rgba(255,255,255,0.6)',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'cursorBlink 1s infinite',
        }}
      />
      <style>{`
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
