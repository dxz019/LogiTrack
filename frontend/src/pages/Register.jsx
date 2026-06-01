import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
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
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-50 py-5">
      <Card className="w-full max-w-30rem shadow-4 border-round-xl p-4">
        <div className="text-center mb-5">
          <i className="pi pi-user-plus text-5xl text-primary mb-3"></i>
          <h2 className="text-3xl font-bold m-0 text-gray-800">Create Account</h2>
          <p className="text-500 mt-2">Join LogiTrack today</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 border-round font-medium">
            <i className="pi pi-exclamation-circle mr-2"></i>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="name" className="font-bold">Full Name</label>
            <InputText 
              id="name" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="John Doe"
              className="p-inputtext-lg mt-1"
              required 
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="email" className="font-bold">Email Address</label>
            <InputText 
              id="email" 
              name="email"
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com"
              className="p-inputtext-lg mt-1"
              required 
            />
          </div>
          
          <div className="field mb-4">
            <label htmlFor="phone" className="font-bold">Phone Number</label>
            <InputText 
              id="phone" 
              name="phone"
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1 234 567 8900"
              className="p-inputtext-lg mt-1"
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="role" className="font-bold">Account Type</label>
            <Dropdown 
              id="role" 
              name="role"
              value={formData.role} 
              options={roleOptions}
              onChange={handleChange} 
              className="p-inputtext-lg mt-1"
            />
          </div>

          <div className="field mb-5">
            <label htmlFor="password" className="font-bold">Password</label>
            <Password 
              id="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              toggleMask
              promptLabel="Choose a password"
              weakLabel="Too simple"
              mediumLabel="Average complexity"
              strongLabel="Complex password"
              inputClassName="p-inputtext-lg mt-1"
              required 
            />
          </div>

          <Button 
            type="submit" 
            label={loading ? "Creating Account..." : "Sign Up"} 
            className="p-button-lg p-button-rounded shadow-2 mb-4" 
            disabled={loading || !formData.email || !formData.password || !formData.name}
          />
        </form>

        <div className="text-center text-500">
          Already have an account? <Link to="/login" className="text-primary font-bold no-underline hover:underline">Log in</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;