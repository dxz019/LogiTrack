import React from 'react';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">📦</div>
        <span className="navbar-title">LogiTrack</span>
      </div>

      <div className="navbar-links">
        <a href="#" className="navbar-link active" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Home</a>
        <a href="#" className="navbar-link">Features</a>
        <a href="#" className="navbar-link">Solutions</a>
        <a href="#" className="navbar-link">Pricing</a>
        <a href="#" className="navbar-link">About Us</a>
        <a href="#" className="navbar-link">Contact</a>
      </div>

      <div className="navbar-actions">
        <button className="btn-ghost">Log In</button>
        <button className="btn-primary">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;