import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AddLease.css';

const AddLease = () => {
  const [formData, setFormData] = useState({
    customer_id: '',
    property_id: '',
    flat_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    status: 'active',
    created_by: '',
  });

  const [authUser, setAuthUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [flats, setFlats] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const token = Cookies.get('token');

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const meRes = await axiosAuth.get('/me');
        const user = meRes.data.user;
        setAuthUser(user);
        console.log('✅ Authenticated User:', user);

        const createdBy = user.created_by ?? user.id;

        setFormData(prev => ({
          ...prev,
          created_by: user.id,
        }));

        await fetchCustomers(createdBy);
        await fetchProperties(createdBy);
      } catch (err) {
        console.error('❌ Error fetching /me:', err.response?.data || err.message);
      }
    };

    fetchInitialData();
  }, []);

  const fetchCustomers = async (createdById) => {
    try {
      const res = await axiosAuth.get(`/filtered-customers?user_id=${createdById}`);
      console.log('📦 Customers:', res.data.customers);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('❌ Failed to fetch customers:', err.response?.data || err.message);
    }
  };

  const fetchProperties = async (createdById) => {
    try {
      const res = await axiosAuth.get(`/indexproperties?user_id=${createdById}`);
      console.log('📦 Properties:', res.data);
      setProperties(res.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch properties:', err.response?.data || err.message);
    }
  };

  const fetchFlats = async (propertyId) => {
    try {
      const res = await axiosAuth.get(`/flats-by-owner?property_id=${propertyId}`);
      console.log('🏢 Flats:', res.data.flats);
      setFlats(res.data.flats || []);
    } catch (err) {
      console.error('❌ Failed to fetch flats:', err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'property_id') {
      fetchFlats(value);
      setFormData((prev) => ({ ...prev, flat_id: '' }));
    }

    setMessage('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Submitting Form Data:', formData);

    try {
      const response = await axiosAuth.post('/storeleases', formData);
      console.log('✅ Lease Created:', response.data);

      setMessage('✅ Lease created successfully!');
      setFormData({
        customer_id: '',
        property_id: '',
        flat_id: '',
        start_date: '',
        end_date: '',
        monthly_rent: '',
        status: 'active',
        created_by: authUser?.id || '',
      });
    } catch (err) {
      if (err.response?.status === 422) {
        console.error('❌ Validation Errors:', err.response.data);
        setErrors(err.response.data);
      } else {
        console.error('❌ Lease creation error:', err.response?.data || err.message);
        setMessage('❌ Failed to create lease.');
      }
    }
  };

  return (
    <div className="add-lease-container">
      <h2>Create Lease</h2>
      {message && (
        <p className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <div>
          <label>Customer</label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Customer</option>
            {customers.length === 0 && <option disabled>No tenants found</option>}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
          {errors.customer_id && <p className="error-text">{errors.customer_id[0]}</p>}
        </div>

        {/* Property + Flat */}
        <div className="input-row">
          <div>
            <label>Property</label>
            <select
              name="property_id"
              value={formData.property_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Property</option>
              {properties.length === 0 && <option disabled>No properties found</option>}
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.property_id && <p className="error-text">{errors.property_id[0]}</p>}
          </div>

          <div>
            <label>Flat</label>
            <select
              name="flat_id"
              value={formData.flat_id}
              onChange={handleChange}
            >
              <option value="">Select Flat (Optional)</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.flat_id && <p className="error-text">{errors.flat_id[0]}</p>}
          </div>
        </div>

        {/* Start Date + End Date */}
        <div className="input-row">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
            {errors.start_date && <p className="error-text">{errors.start_date[0]}</p>}
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
            {errors.end_date && <p className="error-text">{errors.end_date[0]}</p>}
          </div>
        </div>

        {/* Monthly Rent */}
        <div>
          <label>Monthly Rent</label>
          <input
            type="number"
            name="monthly_rent"
            value={formData.monthly_rent}
            onChange={handleChange}
            required
          />
          {errors.monthly_rent && <p className="error-text">{errors.monthly_rent[0]}</p>}
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="terminated">Terminated</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            !formData.customer_id ||
            !formData.property_id ||
            !formData.start_date ||
            !formData.monthly_rent
          }
        >
          Submit Lease
        </button>
      </form>
    </div>
  );
};

export default AddLease;
