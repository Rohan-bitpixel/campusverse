import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar-container">
      <nav className="glass-navbar">
        <NavLink to="/" className="brand-logo">
          <span className="logo-text">CAMPUS <span className="glow-accent">VERSE</span></span>
        </NavLink>

        <div className="nav-portals">
          
        </div>
      </nav>
    </header>
  );
}