import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDBackground from '../components/ThreeDBackground';
import PlaceOrderForm from '../components/Order/PlaceOrderForm';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-5 glass-panel border-bottom-1 border-gray-200"
    >
      <div className="flex justify-content-between align-items-center py-3 px-4 max-w-1200 mx-auto">
        <Link to="/" className="no-underline">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-box text-2xl text-primary"></i>
            <h2 className="m-0 text-xl font-bold text-primary">LogiTrack</h2>
          </div>
        </Link>
        
        <div className="flex align-items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button label="Log In" className="p-button-text" />
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button label="Get Started" className="p-button-rounded" />
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-600 text-sm hidden sm:inline">
                Hi, {user?.name?.split(' ')[0] || 'User'}
              </span>
              {user?.role === 'driver' && (
                <Link to="/driver">
                  <Button label="Driver Dashboard" className="p-button-text p-button-sm" />
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button label="Admin Panel" className="p-button-text p-button-sm" />
                </Link>
              )}
              <Button label="Logout" icon="pi pi-sign-out" className="p-button-text p-button-sm" onClick={handleLogout} />
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const increment = (to - from) / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [from, to, duration]);

  return <span>{count.toLocaleString()}+</span>;
};

const FeatureCard = ({ icon, title, description, delay, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
    >
      <div className="h-full border-round-xl p-5 text-center transition-all transition-duration-300 hover:shadow-5" 
           style={{ 
             background: 'rgba(255,255,255,0.05)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(255,255,255,0.1)'
           }}>
        <div className={`w-4rem h-4rem border-round-xl bg-gradient-${gradient} flex align-items-center justify-content-center mb-4 mx-auto shadow-3`}>
          <i className={`${icon} text-2xl text-white`}></i>
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-300 m-0 line-height-3">{description}</p>
      </div>
    </motion.div>
  );
};

const StepCard = ({ step, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex-1"
    >
      <div className="border-round-xl p-4 h-full text-center border-1 transition-duration-300" 
           style={{ 
             background: 'rgba(30,41,59,0.8)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(255,255,255,0.1)'
           }}>
        <div className="bg-blue-500 text-white border-circle w-3rem h-3rem flex align-items-center justify-content-center mb-3 mx-auto font-bold text-xl shadow-2">
          {step}
        </div>
        <h4 className="font-bold mb-2 text-white">{title}</h4>
        <p className="text-gray-300 m-0 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

const QuickTrack = () => {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/track/${orderId.trim()}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="max-w-30rem mx-auto mt-5"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="p-input-icon-left w-full">
          <i className="pi pi-search text-gray-400" />
          <InputText
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID to track..."
            className="w-full border-round-xl bg-white-alpha-10 text-white px-3 py-2 border-1 border-white-alpha-30"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          />
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" icon="pi pi-arrow-right" className="p-button-rounded bg-blue-500 border-blue-500" disabled={!orderId.trim()} />
        </motion.div>
      </form>
    </motion.div>
  );
};

const PricingCard = ({ title, price, features, popular, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <div className={`h-full border-round-xl p-4 text-center relative overflow-hidden`} 
           style={{ 
             background: popular ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))' : 'rgba(255,255,255,0.05)',
             backdropFilter: 'blur(10px)',
             border: popular ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
             boxShadow: popular ? '0 0 30px rgba(59,130,246,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
           }}>
        {popular && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold" style={{ transform: 'rotate(45deg) translate(30px, -10px)' }}>
            POPULAR
          </div>
        )}
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <div className="text-3xl font-extrabold mb-3 text-blue-400">{price}</div>
        <ul className="list-none p-0 m-0 mb-4 text-left">
          {features.map((f, i) => (
            <li key={i} className="flex align-items-start gap-2 mb-2 text-gray-300 text-sm">
              <i className="pi pi-check text-green-400 mt-1"></i>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link to="/register">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button label="Get Started" className={`p-button-rounded w-full font-bold ${popular ? 'bg-blue-500 border-blue-500' : ''}`} />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center h-screen" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <ThreeDBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <i className="pi pi-spinner text-4xl text-white"></i>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <ThreeDBackground />
      <div className="relative z-1">
        <Navbar />

        {!isAuthenticated ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative py-6 overflow-hidden min-h-screen"
            >
            <motion.div
              className="absolute top-0 left-20 w-30rem h-30rem bg-blue-500 opacity-20 border-circle"
              style={{ filter: 'blur(100px)' }}
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 right-20 w-25rem h-25rem bg-indigo-500 opacity-20 border-circle"
              style={{ filter: 'blur(80px)' }}
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-20 right-40 w-20rem h-20rem bg-purple-500 opacity-15 border-circle"
              style={{ filter: 'blur(60px)' }}
              animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-1 px-4 py-6 max-w-1200 mx-auto text-center flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white" style={{ lineHeight: '1.2' }}>
                  Fast, Reliable<br />
                  <span className="text-blue-400">Delivery Logistics</span>
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🚚
                  </motion.span>
                </h1>
                <p className="text-xl text-gray-300 mx-auto mb-5" style={{ maxWidth: '600px' }}>
                  Track your packages in real-time with our network of professional drivers.
                  Get your deliveries done faster, safer, and smarter.
                </p>

                <div className="flex flex-wrap gap-3 justify-content-center mb-6">
                  <Link to="/register">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button label="Get Started Free" icon="pi pi-arrow-right" className="p-button-lg p-button-rounded font-bold bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-3 glow-blue" />
                    </motion.div>
                  </Link>
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button label="Log In" icon="pi pi-sign-in" className="p-button-lg p-button-rounded p-button-outlined font-bold shadow-3" />
                    </motion.div>
                  </Link>
                </div>

                <QuickTrack />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                  className="max-w-50rem mx-auto mt-6"
                >
                  <div className="border-round-xl p-4 shadow-5 animated-border" style={{ 
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59,130,246,0.3)'
                  }}>
                    <div className="grid text-center">
                      <div className="col-6 md:col-3">
                        <div className="text-blue-400 text-2xl md:text-3xl font-bold"><AnimatedCounter from={0} to={250} />M+</div>
                        <div className="text-gray-400 text-sm">Active Users</div>
                      </div>
                      <div className="col-6 md:col-3">
                        <div className="text-green-400 text-2xl md:text-3xl font-bold"><AnimatedCounter from={0} to={99} />%</div>
                        <div className="text-gray-400 text-sm">On-Time Delivery</div>
                      </div>
                      <div className="col-6 md:col-3">
                        <div className="text-yellow-400 text-2xl md:text-3xl font-bold"><AnimatedCounter from={0} to={150} />+</div>
                        <div className="text-gray-400 text-sm">Cities Covered</div>
                      </div>
                      <div className="col-6 md:col-3">
                        <div className="text-indigo-400 text-2xl md:text-3xl font-bold"><AnimatedCounter from={0} to={24} />/7</div>
                        <div className="text-gray-400 text-sm">Support</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="py-6 px-4 relative"
            style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1), transparent 70%)' }}
          >
            <div className="max-w-1200 mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-5"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Why Choose LogiTrack</h2>
                <p className="text-lg text-gray-300 mx-auto" style={{ maxWidth: '500px' }}>
                  We're revolutionizing delivery with technology-first approach.
                </p>
              </motion.div>

              <div className="grid">
                <div className="col-12 md:col-4">
                  <FeatureCard
                    icon="pi pi-bolt"
                    title="Lightning Fast"
                    description="Real-time tracking with instant updates on your deliveries through our advanced routing algorithms."
                    delay={0.1}
                    gradient="red"
                  />
                </div>
                <div className="col-12 md:col-4">
                  <FeatureCard
                    icon="pi pi-shield"
                    title="Secure & Reliable"
                    description="Your packages are handled with care by verified, background-checked drivers with insurance coverage."
                    delay={0.2}
                    gradient="green"
                  />
                </div>
                <div className="col-12 md:col-4">
                  <FeatureCard
                    icon="pi pi-globe"
                    title="Global Coverage"
                    description="Deliver anywhere with our network of professional drivers across 150+ cities worldwide."
                    delay={0.3}
                    gradient="blue"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="py-6 px-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
            <div className="max-w-1200 mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-5"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">How It Works</h2>
                <p className="text-lg text-gray-300 mx-auto" style={{ maxWidth: '500px' }}>
                  Just three simple steps to get your delivery on the move.
                </p>
              </motion.div>

              <div className="flex flex-column md:flex-row gap-4 justify-content-center">
                <StepCard step="01" title="Place Order" description="Enter pickup and delivery addresses in seconds through our intuitive form." delay={0.1} />
                <StepCard step="02" title="Driver Assigned" description="We match you with the best available driver near your location." delay={0.2} />
                <StepCard step="03" title="Track Live" description="Follow your package in real-time on the map with live ETA updates." delay={0.3} />
              </div>
            </div>
          </div>

          <div className="py-6 px-4 relative">
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.05), transparent)' }}
            />
            <div className="max-w-1200 mx-auto relative z-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-5"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Pricing Plans</h2>
                <p className="text-lg text-gray-300 mx-auto" style={{ maxWidth: '500px' }}>
                  Choose the perfect plan for your delivery needs.
                </p>
              </motion.div>

              <div className="grid">
                <div className="col-12 md:col-4">
                  <PricingCard
                    title="Basic"
                    price="Free"
                    features={["Up to 5 deliveries/month", "Standard tracking", "Email support"]}
                    delay={0.1}
                  />
                </div>
                <div className="col-12 md:col-4">
                  <PricingCard
                    title="Pro"
                    price="$29/mo"
                    features={["Unlimited deliveries", "Real-time tracking", "Priority support", "Analytics dashboard"]}
                    popular={true}
                    delay={0.2}
                  />
                </div>
                <div className="col-12 md:col-4">
                  <PricingCard
                    title="Enterprise"
                    price="Custom"
                    features={["Custom volume", "API access", "Dedicated manager", "SLA guarantee"]}
                    delay={0.3}
                  />
                </div>
              </div>
            </div>
          </div>

          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-5 px-4 text-center"
            style={{ background: 'rgba(15,23,42,0.8)' }}
          >
            <p className="text-gray-400 m-0">© 2024 LogiTrack. All rights reserved.</p>
          </motion.footer>
        </>
      ) : (
        <div className="py-6 px-4">
          <div className="text-center mb-6">
<motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
             <h1 className="text-4xl font-extrabold text-blue-400 mb-3">Welcome Back</h1>
             <p className="text-xl text-gray-300 m-0">Place your delivery order below</p>
           </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-content-center"
          >
            <div className="w-full" style={{ maxWidth: '600px' }}>
              <PlaceOrderForm />
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Home;