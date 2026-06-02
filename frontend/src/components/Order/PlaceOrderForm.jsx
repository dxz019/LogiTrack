// Place Order Form - Clean white design for customers to create deliveries
// Uses Google Maps integration for address autocomplete (demo uses mock coordinates)

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import useOrderStore from '../../store/orderStore';

export const PlaceOrderForm = () => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    priority: 'normal'
  });
  
  // Demo coordinates - in production these would come from Google Places Autocomplete
  const mockCoords = {
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    deliveryLat: 40.7306,
    deliveryLng: -73.9352
  };

  const { placeOrder, loading, error } = useOrderStore();
  const navigate = useNavigate();

  const priorities = [
    { label: 'Normal Delivery', value: 'normal' },
    { label: 'Express (+$5)', value: 'express' },
    { label: 'Urgent (+$10)', value: 'urgent' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.deliveryAddress) return;

    try {
      const order = await placeOrder({ ...formData, ...mockCoords });
      navigate(`/track/${order.id}`);
    } catch (err) {
      console.error("Failed to place order", err);
    }
  };

  return (
    <Card className="shadow-3 border-round-xl max-w-30rem mx-auto bg-white">
      <h2 className="mt-0 mb-4 text-center text-blue-600">Place New Delivery</h2>
      
      {error && <div className="p-3 mb-4 bg-red-50 text-red-600 border-round">{error}</div>}

      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field mb-4">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-map-marker text-green-500" />
            <InputText 
              id="pickupAddress" 
              name="pickupAddress" 
              value={formData.pickupAddress} 
              onChange={handleChange} 
              placeholder="Pickup address"
              className="w-full border-round-lg bg-white py-3 px-4 border-1 border-gray-300"
              required 
            />
          </span>
        </div>

        <div className="field mb-4">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-flag text-red-500" />
            <InputText 
              id="deliveryAddress" 
              name="deliveryAddress" 
              value={formData.deliveryAddress} 
              onChange={handleChange} 
              placeholder="Delivery address"
              className="w-full border-round-lg bg-white py-3 px-4 border-1 border-gray-300"
              required 
            />
          </span>
        </div>

        <div className="field mb-4">
          <Dropdown 
            id="priority" 
            name="priority" 
            value={formData.priority} 
            options={priorities} 
            onChange={handleChange} 
            placeholder="Delivery speed"
            className="w-full border-round-lg"
          />
        </div>

        <div className="field mb-5">
          <InputTextarea 
            id="packageDescription" 
            name="packageDescription" 
            value={formData.packageDescription} 
            onChange={handleChange} 
            rows={3} 
            placeholder="Package details (optional)"
            className="w-full border-round-lg bg-white py-2 px-3 border-1 border-gray-300"
            autoResize 
          />
        </div>

        <Button 
          type="submit" 
          label={loading ? "Processing..." : "Confirm Order"} 
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"} 
          className="w-full p-button-lg p-button-rounded bg-blue-600 border-blue-600 hover:bg-blue-700 py-3"
          disabled={loading || !formData.pickupAddress || !formData.deliveryAddress}
        />
      </form>
    </Card>
  );
};

export default PlaceOrderForm;