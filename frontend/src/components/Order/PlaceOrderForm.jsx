import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import useOrderStore from '../../store/orderStore';

export const PlaceOrderForm = () => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    priority: 'normal'
  });
  
  // For a real app, you would use Google Places Autocomplete here
  // and extract lat/lng. For this demo we'll use placeholder coords.
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
    { label: 'Express Delivery (+$5)', value: 'express' },
    { label: 'Urgent Delivery (+$10)', value: 'urgent' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.deliveryAddress) return;

    try {
      const order = await placeOrder({
        ...formData,
        ...mockCoords
      });
      // Redirect to tracking page
      navigate(`/track/${order.id}`);
    } catch (err) {
      console.error("Failed to place order", err);
    }
  };

  return (
    <Card className="shadow-3 border-round-xl max-w-30rem mx-auto">
      <h2 className="mt-0 mb-4 text-center text-primary">Place New Delivery</h2>
      
      {error && <div className="p-3 mb-4 bg-red-100 text-red-800 border-round text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field mb-4">
          <label htmlFor="pickupAddress" className="font-bold block mb-2">Pickup Address</label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon bg-primary-reverse border-primary">
                <i className="pi pi-map-marker text-green-500"></i>
            </span>
            <InputText 
              id="pickupAddress" 
              name="pickupAddress" 
              value={formData.pickupAddress} 
              onChange={handleChange} 
              placeholder="123 Origin St, City"
              className="p-inputtext-lg"
              required 
            />
          </div>
        </div>

        <div className="field mb-4">
          <label htmlFor="deliveryAddress" className="font-bold block mb-2">Delivery Address</label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon bg-primary-reverse border-primary">
                <i className="pi pi-flag text-red-500"></i>
            </span>
            <InputText 
              id="deliveryAddress" 
              name="deliveryAddress" 
              value={formData.deliveryAddress} 
              onChange={handleChange} 
              placeholder="456 Destination Ave, City"
              className="p-inputtext-lg"
              required 
            />
          </div>
        </div>

        <div className="field mb-4">
          <label htmlFor="priority" className="font-bold block mb-2">Delivery Speed</label>
          <Dropdown 
            id="priority" 
            name="priority" 
            value={formData.priority} 
            options={priorities} 
            onChange={handleChange} 
            className="p-inputtext-lg"
          />
        </div>

        <div className="field mb-5">
          <label htmlFor="packageDescription" className="font-bold block mb-2">Package Description</label>
          <InputTextarea 
            id="packageDescription" 
            name="packageDescription" 
            value={formData.packageDescription} 
            onChange={handleChange} 
            rows={3} 
            placeholder="e.g. Small box, fragile electronics"
            autoResize 
          />
        </div>

        <Button 
          type="submit" 
          label={loading ? "Processing..." : "Confirm & Pay"} 
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"} 
          className="p-button-lg p-button-rounded shadow-2"
          disabled={loading || !formData.pickupAddress || !formData.deliveryAddress}
        />
      </form>
    </Card>
  );
};

export default PlaceOrderForm;
