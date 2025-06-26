import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AddCustomer.css';

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_id: '',
    flat_id: '',
    phone: '',
    address: '',
    status: 'active',
  });

  const [companies, setCompanies] = useState([]);
  const [flats, setFlats] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const token = Cookies.get('token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/companies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data);
      } catch {}
    };

    const fetchFlats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/indexflats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlats(res.data.data || res.data);
      } catch {}
    };

    fetchCompanies();
    fetchFlats();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors({});
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage('User not authenticated. Please login again.');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: userId,
      };

      await axios.post('http://localhost:8000/api/customers', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setMessage('✅ Customer added successfully.');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_id: '',
        flat_id: '',
        phone: '',
        address: '',
        status: 'active',
      });
      setErrors({});
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage('❌ Failed to add customer.');
      }
    }
  };

  return (
    <div className="add-customer-container">
      <h2>Add Customer</h2>
      {message && <p className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
          {errors.name && <p className="error-text">{errors.name[0]}</p>}
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <p className="error-text">{errors.email[0]}</p>}
        </div>

        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <p className="error-text">{errors.password[0]}</p>}
        </div>

        <div>
          <label>Confirm Password</label>
          <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
        </div>

        <div>
          <label>Company</label>
          <select name="company_id" value={formData.company_id} onChange={handleChange} required>
            <option value="">Select company</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.company_id && <p className="error-text">{errors.company_id[0]}</p>}
        </div>

        <div>
          <label>Flat (optional)</label>
          <select name="flat_id" value={formData.flat_id} onChange={handleChange}>
            <option value="">Select flat</option>
            {flats.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.flat_id && <p className="error-text">{errors.flat_id[0]}</p>}
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <p className="error-text">{errors.phone[0]}</p>}
        </div>

        <div className="full-width">
          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={2} />
          {errors.address && <p className="error-text">{errors.address[0]}</p>}
        </div>

        <div>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <p className="error-text">{errors.status[0]}</p>}
        </div>

        <button type="submit">Add Customer</button>
      </form>
    </div>
  );
};

export default AddCustomer;