import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      // Let's rely on role to navigate if possible, or just go to home
      const user = useAuthStore.getState().user;
      if (user?.role === 'driver') navigate('/driver');
      else if (user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex align-items-center justify-content-center h-screen bg-gray-50">
      <Card className="w-full max-w-28rem shadow-4 border-round-xl p-4">
        <div className="text-center mb-5">
          <i className="pi pi-box text-5xl text-primary mb-3"></i>
          <h2 className="text-3xl font-bold m-0 text-gray-800">Welcome Back</h2>
          <p className="text-500 mt-2">Sign in to continue to LogiTrack</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 border-round font-medium">
            <i className="pi pi-exclamation-circle mr-2"></i>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope" />
              <InputText 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email address"
                className="p-inputtext-lg"
                required 
              />
            </span>
          </div>

          <div className="field mb-5">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-lock" />
              <Password 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                feedback={false}
                toggleMask
                placeholder="Password"
                inputClassName="p-inputtext-lg"
                required 
              />
            </span>
          </div>

          <Button 
            type="submit" 
            label={loading ? "Signing in..." : "Sign In"} 
            className="p-button-lg p-button-rounded shadow-2 mb-4" 
            disabled={loading || !email || !password}
          />
        </form>

        <div className="text-center text-500">
          Don't have an account? <Link to="/register" className="text-primary font-bold no-underline hover:underline">Register</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;