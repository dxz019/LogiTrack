import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/stats.css';

gsap.registerPlugin(ScrollTrigger);

const StatsBar = () => {
  const statsRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!statsRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(40px)';

      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cardRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
          });

          document.querySelectorAll('.stat-value').forEach((el, i) => {
            const target = parseFloat(el.dataset.target) || 0;
            const suffix = el.dataset.suffix || '';
            const obj = { value: 0 };
            gsap.to(obj, {
              value: target,
              duration: 2,
              delay: i * 0.12,
              ease: 'power2.out',
              onUpdate: () => {
                const formatted = Number.isInteger(target)
                  ? Math.round(obj.value).toLocaleString()
                  : obj.value % 1 === 0
                    ? obj.value.toFixed(0)
                    : obj.value.toFixed(1);
                el.textContent = formatted + suffix;
              }
            });
          });
        },
        once: true
      });
    }, statsRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: '👥', bgClass: 'blue', value: '250M+', label: 'Active Users', target: 250 },
    { icon: '🛡️', bgClass: 'teal', value: '99.9%', label: 'On-Time Delivery', target: 99.9 },
    { icon: '🏙️', bgClass: 'amber', value: '150+', label: 'Cities Covered', target: 150 },
    { icon: '🎧', bgClass: 'purple', value: '24/7', label: 'Support', target: 24 }
  ];

  return (
    <div className="stats-bar" ref={statsRef}>
      <div className="stats-card" ref={cardRef}>
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <div className="stat-item">
              <div className={`stat-icon ${stat.bgClass}`}>{stat.icon}</div>
              <div>
                <div className="stat-value" data-target={stat.target} data-suffix={stat.value.replace(/[0-9.+-]/g, '').trim()}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
            {i < stats.length - 1 && <div className="stat-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
