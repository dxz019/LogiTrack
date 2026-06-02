// Registration page - modern clean white design
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const roleOptions = [
    { label: 'Customer', value: 'customer' },
    { label: 'Driver', value: 'driver' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await register(formData);
      if (formData.role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' }}>
      <div className="w-full max-w-30rem p-4">
        <div className="text-center mb-5">
          <div className="w-4rem h-4rem bg-blue-600 border-round-xl flex align-items-center justify-content-center mx-auto mb-3 shadow-2">
            <i className="pi pi-user-plus text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold m-0 text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2 mb-0">Join LogiTrack for fast deliveries</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 border-round font-medium border-left-3 border-red-500">
            <i className="pi pi-exclamation-circle mr-2"></i>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-user text-gray-400" />
              <InputText 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Full name"
                className="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
                required 
              />
            </span>
          </div>

          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope text-gray-400" />
              <InputText 
                id="email" 
                name="email"
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email address"
                className="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
                required 
              />
            </span>
          </div>

          <div className="field mb-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-phone text-gray-400" />
              <InputText 
                id="phone" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Phone number (optional)"
                className="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
              />
            </span>
          </div>

          <div className="field mb-4">
            <Dropdown 
              id="role" 
              name="role"
              value={formData.role} 
              options={roleOptions}
              onChange={handleChange} 
              placeholder="Select account type"
              className="w-full border-round-lg"
            />
          </div>

          <div className="field mb-4">
            <Password 
              id="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              toggleMask
              feedback={false}
              placeholder="Create password"
              inputClassName="w-full border-round-lg bg-white text-gray-800 py-3 px-4 border-1 border-gray-300"
              required 
            />
          </div>

          <Button 
            type="submit" 
            label={loading ? "Creating..." : "Create Account"} 
            className="w-full p-button-lg p-button-rounded bg-blue-600 border-blue-600 hover:bg-blue-700 py-3 font-medium mb-4" 
            disabled={loading || !formData.email || !formData.password || !formData.name}
          />
        </form>

        <div className="text-center bg-white p-4 border-round-lg shadow-2">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 font-bold no-underline hover:text-blue-800">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;