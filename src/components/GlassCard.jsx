import React, { useRef } from 'react';
import './GlassCard.css';

export default function GlassCard({ children, className = '', hoverEffect = true, onClick }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !hoverEffect) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set custom CSS variables directly on the element
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={cardRef}
      className={`glass-card ${hoverEffect ? 'glass-card-interactive' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <div className="card-spotlight" />
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}