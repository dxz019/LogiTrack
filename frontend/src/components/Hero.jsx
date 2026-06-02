import React, { useEffect } from 'react';
import FloatingOrderCard from './FloatingOrderCard';
import '../styles/hero.css';

const Hero = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gsap || typeof window.gsap.context !== 'function') return;

    const ctx = window.gsap.context(() => {
      window.gsap.fromTo('.hero-title .line-1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0);
      window.gsap.fromTo('.hero-title .line-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
      window.gsap.fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
      window.gsap.fromTo('.hero-body', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.15);
      window.gsap.fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.2);
      window.gsap.fromTo('.track-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.25);
      window.gsap.fromTo('.hero-visual', { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, 0.2);
      window.gsap.fromTo('.floating-card', { opacity: 0, x: 60, y: 10 }, { opacity: 1, x: 0, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, 0.4);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚛</span>
            <span>Smart Logistics, Delivered</span>
          </div>

          <div className="hero-title">
            <span className="line-1">Fast, Reliable</span>
            <span className="line-2">Delivery Logistics</span>
          </div>

          <p className="hero-body">
            Real-time tracking, intelligent routing, and instant notifications for your delivery operations.
          </p>

          <div className="hero-cta">
            <button className="btn-primary" type="button">🚀 Get Started Free</button>
            <button className="btn-secondary" type="button">↗ Log In</button>
          </div>

          <div className="track-bar">
            <input placeholder="Enter Order ID to track..." />
            <button aria-label="Track" type="button">→</button>
          </div>
        </div>

        <div className="hero-visual">
          <img src="/hero-truck.png" alt="Delivery truck" />
          <div className="floating-cards">
            <FloatingOrderCard status="delivered" delay={0} orderNum="LT1256" statusText="Out for Delivery" statusClass="status-blue" timeAgo="2 min ago" icon="🚚" />
            <FloatingOrderCard status="transit" delay={0.4} orderNum="LT1257" statusText="In Transit" statusClass="status-teal" timeAgo="15 min ago" icon="🚚" />
            <FloatingOrderCard status="delivered" delay={0.8} orderNum="LT1258" statusText="Delivered" statusClass="status-green" timeAgo="1 hour ago" icon="✓" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
