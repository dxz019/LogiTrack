import React, { useEffect, useRef } from 'react';
import '../styles/dashboard.css';

const DashboardPreview = () => {
  const dashboardRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const gsap = window.gsap;
    if (!gsap) return;

    let ctx;
    try {
      ctx = gsap.context(() => {
        const section = dashboardRef.current;
        const card = tiltRef.current;
        if (!section || !card) return;

        gsap.to(card, {
          rotateX: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 20%',
            scrub: true,
          },
        });
      }, dashboardRef);
    } catch {
      // ignore animation errors in test environments
    }

    return () => {
      if (ctx && typeof ctx.revert === 'function') {
        ctx.revert();
      }
    };
  }, []);

  const recentOrders = [
    { id: 'LT1256', location: 'New York, NY', status: 'Delivered', variant: 'green' },
    { id: 'LT1257', location: 'London, UK', status: 'In Transit', variant: 'teal' },
    { id: 'LT1258', location: 'Dubai, UAE', status: 'Pending', variant: 'amber' }
  ];

  return (
    <section className="dashboard-section" ref={dashboardRef}>
      <div className="dashboard-wrapper">
        <div className="dashboard-card" ref={tiltRef}>
          <div className="dashboard-inner">
            <div className="dashboard-sidebar">
              <div className="sidebar-brand">
                <div className="sidebar-logo">📦</div>
                <span>LogiTrack</span>
              </div>
              <nav className="flex flex-col gap-2">
                <button type="button" className="dashboard-nav-item active">📊 Dashboard</button>
                <button type="button" className="dashboard-nav-item">📦 Orders</button>
                <button type="button" className="dashboard-nav-item">🗺️ Tracking</button>
                <button type="button" className="dashboard-nav-item">🚚 Drivers</button>
                <button type="button" className="dashboard-nav-item">📈 Analytics</button>
                <button type="button" className="dashboard-nav-item">⚙️ Settings</button>
              </nav>
            </div>
            <div className="dashboard-main">
              <div className="dashboard-header">
                <h2 className="dashboard-title">Dashboard</h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.15)', color: 'var(--blue)', fontSize: '0.8rem' }}>🔍</div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.15)', color: 'var(--blue)', fontSize: '0.8rem' }}>↻</div>
                </div>
              </div>

              <div className="mini-cards">
                <div className="mini-card">
                  <div className="mini-card-label">Total Orders</div>
                  <div className="mini-card-value" style={{ color: 'var(--blue)' }}>12,540</div>
                  <div className="mini-card-change" style={{ color: 'var(--green)' }}>+18.2%</div>
                </div>
                <div className="mini-card">
                  <div className="mini-card-label">In Transit</div>
                  <div className="mini-card-value" style={{ color: '#14B8A6' }}>8,420</div>
                  <div className="mini-card-change" style={{ color: 'var(--green)' }}>+14.7%</div>
                </div>
                <div className="mini-card">
                  <div className="mini-card-label">Delivered</div>
                  <div className="mini-card-value" style={{ color: 'var(--green)' }}>4,120</div>
                  <div className="mini-card-change" style={{ color: 'var(--green)' }}>+22.1%</div>
                </div>
                <div className="mini-card">
                  <div className="mini-card-label">Cancelled</div>
                  <div className="mini-card-value" style={{ color: '#EF4444' }}>230</div>
                  <div className="mini-card-change" style={{ color: '#EF4444' }}>-2.4%</div>
                </div>
              </div>

              <div className="dashboard-bottom">
                <div className="map-panel">
                  <div className="panel-header">Live Tracking</div>
                  <div className="map-body">
                    <div className="map-grid" />
                    <svg viewBox="0 0 400 200" className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
                      <path d="M40 170 C100 110 160 150 220 90 S320 70 380 120" fill="none" stroke="var(--blue2)" strokeWidth="4" strokeLinecap="round" />
                      <path d="M40 170 C100 110 160 150 220 90 S320 70 380 120" fill="none" stroke="var(--blue)" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
                    </svg>
                    <div className="map-truck" style={{ top: '18%', left: '30%' }}>🚚</div>
                    <div className="map-truck" style={{ top: '28%', left: '55%' }}>🚚</div>
                  </div>
                </div>
                <div className="orders-panel">
                  <div className="panel-header">Recent Orders</div>
                  <div className="orders-body">
                    {recentOrders.map((order) => (
                      <div className="order-row" key={order.id}>
                        <div className="order-meta">
                          <div className="order-id">{order.id}</div>
                          <div className="order-location">{order.location}</div>
                        </div>
                        <span className={`order-badge ${order.variant}`}>{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
