import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddOwner.css'; // Optional styling

const AddOwner = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const token = Cookies.get('token');
  const createdBy = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      role: 'owner',           // ✅ default role
      created_by: createdBy,   // who created this owner
    };

    try {
      await axios.post('http://localhost:8000/api/register', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('✅ Owner registered successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });

      // ✅ Navigate to Manage Owners after successful registration
      navigate('/manage-owner');

    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      } else {
        setMessage('❌ Failed to register owner.');
      }
    }
  };

  return (
    <div className="add-owner-container" style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Register New Owner</h2>
      {message && (
        <p style={{ color: message.includes('❌') ? 'red' : 'green' }}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label><br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p style={{ color: 'red' }}>{errors.name[0]}</p>}
        </div>

        <div>
          <label>Email</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email[0]}</p>}
        </div>

        <div>
          <label>Password</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p style={{ color: 'red' }}>{errors.password[0]}</p>}
        </div>

        <div>
          <label>Confirm Password</label><br />
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Register Owner</button>
      </form>
    </div>
  );
};

export default AddOwner;
