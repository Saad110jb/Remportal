import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddProperty.css';

const AddProperty = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price: '',
    status: 'available',
    property_for: 'sale',
    type: 'commercial',
    is_running: 0,
    company_id: '',
    owner_id: '',
  });

  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);

  const token = Cookies.get('token');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      setMessage('❌ Authentication required. Please log in again.');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/companies', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        setCompanies(res.data);
      } catch (err) {
        setMessage('❌ Failed to load companies.');
      }
    };

    fetchCompanies();
  }, [token, userId]);

  useEffect(() => {
    if (!token || !formData.company_id) return;

    const fetchOwner = async () => {
      setOwnerLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/company-users?company_id=${formData.company_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (res.data.length > 0) {
          const owner = res.data[0];
          setFormData((prev) => ({ ...prev, owner_id: owner.id }));
        } else {
          setMessage('❌ No owner found for this company.');
          setFormData((prev) => ({ ...prev, owner_id: '' }));
        }
      } catch (err) {
        setMessage('❌ Error fetching owner.');
      } finally {
        setOwnerLoading(false);
      }
    };

    fetchOwner();
  }, [formData.company_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !userId) {
      setMessage('❌ Authentication missing. Please login.');
      return;
    }

    if (!formData.owner_id) {
      setMessage('❌ Owner not assigned yet. Please wait a moment.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      is_running: Number(formData.is_running),
      company_id: Number(formData.company_id),
      owner_id: Number(formData.owner_id),
      user_id: Number(userId),
    };

    try {
      const res = await axios.post('http://localhost:8000/api/storeproperties', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setMessage('✅ ' + (res.data.message || 'Property added successfully.'));
      setTimeout(() => {
        navigate('/manage-property');
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data ? Object.values(err.response.data).flat().join('\n') : 'Network error';
      setMessage('❌ ' + errorMsg);
    }
  };

  return (
    <div className="add-property-container">
      <h2>Add New Property</h2>
      {message && (
        <p className={`add-property-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <form className="add-property-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Property Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Property For</label>
            <select name="property_for" value={formData.property_for} onChange={handleChange}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Is Running</label>
            <select name="is_running" value={formData.is_running} onChange={handleChange}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div className="form-group1">
            <label>Company</label>
            <select name="company_id" value={formData.company_id} onChange={handleChange} required>
              <option value="">-- Select Company --</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ width: '100%' }}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
        </div>

        {ownerLoading && <p style={{ fontStyle: 'italic' }}>🔄 Fetching owner info...</p>}

        <button type="submit" disabled={!formData.owner_id || ownerLoading}>
          ➕ Add Property
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
