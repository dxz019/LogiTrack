import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import useAuthStore from './store/authStore';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackOrder from './pages/TrackOrder';
import OrderHistory from './pages/OrderHistory';
import DriverApp from './pages/DriverApp';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) return (
    <div className="flex align-items-center justify-content-center h-screen" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
      <i className="pi pi-spinner pi-spin text-4xl text-white"></i>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Attempt to refresh token or get current user on load
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
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
