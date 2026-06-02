// Login.jsx - User authentication page component
// Handles user login with email/password authentication flow
// Redirects users based on role after successful authentication

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  // Form state management - controlled inputs for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error message state for displaying authentication failures
  const [errorMsg, setErrorMsg] = useState('');
  
  // Get login action and loading state from Zustand store
  const { login, loading } = useAuthStore();
  
  // React Router hook for programmatic navigation
  const navigate = useNavigate();

  // Form submission handler - authenticates user via API
  // On success: redirects based on user role (driver→/driver, admin→/admin, customer→/)
  // On failure: displays error message
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'driver') navigate('/driver');
      else if (user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    // Full-screen centered layout with gradient background
    <div className="flex align-items-center justify-content-center min-h-screen" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' }}>
      <div className="w-full max-w-28rem p-4">
        {/* Logo and header section */}
        <div className="text-center mb-5">
          <div className="w-4rem h-4rem bg-blue-600 border-round-xl flex align-items-center justify-content-center mx-auto mb-3 shadow-2">
            <i className="pi pi-box text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold m-0 text-gray-800">Sign In</h1>
          <p className="text-gray-600 mt-2 mb-0">Welcome back to LogiTrack</p>
        </div>

        {/* Error alert banner - appears when login fails */}
        {errorMsg && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 border-round font-medium border-left-3 border-red-500">
            <i className="pi pi-exclamation-circle mr-2"></i>
            {errorMsg}
          </div>
        )}

        {/* Login form with email and password fields */}
        <form onSubmit={handleSubmit} className="p-fluid">
          {/* Email field with envelope icon */}
          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope text-gray-400" />
              <InputText 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email address"
                className="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
                required 
              />
            </span>
          </div>

          {/* Password field with lock icon - includes show/hide toggle */}
          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-lock text-gray-400" />
              <Password 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                feedback={false}
                toggleMask
                placeholder="Password"
                inputClassName="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
                required 
              />
            </span>
          </div>

          {/* Submit button - disabled during loading or when fields empty */}
          <Button 
            type="submit" 
            label={loading ? "Signing in..." : "Sign In"} 
            className="w-full p-button-lg p-button-rounded bg-blue-600 border-blue-600 hover:bg-blue-700 py-3 font-medium mb-4" 
            disabled={loading || !email || !password}
          />
        </form>

        {/* Link to registration page - for new users */}
        <div className="text-center bg-white p-4 border-round-lg shadow-2">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link to="/register" className="text-blue-600 font-bold no-underline hover:text-blue-800">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;