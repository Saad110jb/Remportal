import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddProperty.css'; // Reuse the styled form layout

const AddFlat = () => {
  const [formData, setFormData] = useState({
    property_id: '',
    name: '',
    size: '',
    price: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    kitchen: '',
    balcony: '',
    is_running: 1,
    status: 'available',
    type: 'residential',
    
  });

  const [properties, setProperties] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = Cookies.get('token');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!userId || !token) {
        setMessage('❌ Authentication required.');
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8000/api/indexproperties?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const data = res.data?.data || res.data;
        setProperties(data);
      } catch (err) {
        setMessage('❌ Failed to load properties (403/401). Check token or backend response.');
      }
    };

    fetchProperties();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'property_id') {
      const selectedProperty = properties.find(p => String(p.id) === String(value));

      if (selectedProperty) {
        setFormData(prev => ({
          ...prev,
          property_id: value,
          company_id: selectedProperty.company_id || '',
          owner_id: selectedProperty.owner_id || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          property_id: value,
          company_id: '',
          owner_id: ''
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !userId) {
      setMessage('❌ You must be logged in.');
      return;
    }

    const payload = {
      ...formData,
      size: Number(formData.size),
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      kitchen: Number(formData.kitchen),
      balcony: Number(formData.balcony),
      is_running: Number(formData.is_running),
        company_id: Number(formData.company_id),
        owner_id: Number(formData.owner_id),
    };
console.log('Submitting payload:', payload);
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/addflats', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setMessage('✅ ' + res.data);
      setTimeout(() => navigate('/manage-flat'), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data
          ? Object.values(err.response.data).flat().join('\n')
          : '❌ Network or server error.';
      setMessage('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container">
      <h2>Add New Flat</h2>
      {message && (
        <p className={`add-property-message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <form className="add-property-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Property</label>
            <select name="property_id" value={formData.property_id} onChange={handleChange} required>
              <option value="">-- Select Property --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Flat Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Size (sq ft)</label>
            <input type="number" name="size" value={formData.size} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Bedrooms</label>
            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Bathrooms</label>
            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Kitchen</label>
            <input type="number" name="kitchen" value={formData.kitchen} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Balcony</label>
            <input type="number" name="balcony" value={formData.balcony} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Is Running</label>
            <select name="is_running" value={formData.is_running} onChange={handleChange}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : '➕ Add Flat'}
        </button>
      </form>
    </div>
  );
};

export default AddFlat;
