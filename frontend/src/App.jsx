import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackOrder from './pages/TrackOrder';
import OrderHistory from './pages/OrderHistory';
import DriverApp from './pages/DriverApp';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children, roles }) => {
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check auth status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: payload.role, name: payload.name });
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex align-items-center justify-content-center h-screen" style={{ background: '#020818' }}>
      <i className="pi pi-spinner pi-spin text-4xl" style={{ color: 'var(--blue)' }}></i>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

export { ProtectedRoute };

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
{/* Customer Routes */}
         <Route 
           path="/track/:orderId" 
           element={
             <ProtectedRoute roles={['customer', 'admin']}>
               <TrackOrder />
             </ProtectedRoute>
           } 
         />
         <Route 
           path="/orders" 
           element={
             <ProtectedRoute roles={['customer']}>
               <OrderHistory />
             </ProtectedRoute>
           } 
         />
        
        {/* Driver Route */}
        <Route 
          path="/driver" 
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/deliveries" 
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/map" 
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/earnings" 
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/profile" 
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
