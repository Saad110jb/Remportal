import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AddHR.css';

const AddHR = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee',
    created_by: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = Cookies.get('token');

  // Set created_by from localStorage on mount
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('user_id'));
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        created_by: userId,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors({});
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage('');

    try {
      await axios.post('http://localhost:8000/api/register', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('✅ HR added successfully!');
      setFormData((prev) => ({
        ...prev,
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      }));
    } catch (err) {
      const res = err.response;
      if (res?.status === 422) {
        setErrors(res.data);
      } else if (res?.status === 403) {
        setMessage(res.data.message || '❌ You can only add one HR.');
      } else {
        setMessage('❌ Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-hr-container" style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Add HR</h2>

      {message && (
        <p style={{ color: message.includes('❌') ? 'red' : 'green' }}>{message}</p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label><br />
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.name && <p className="error">{errors.name[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label><br />
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.email && <p className="error">{errors.email[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label><br />
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.password && <p className="error">{errors.password[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirmation">Confirm Password</label><br />
          <input
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add HR'}
        </button>
      </form>
    </div>
  );
};

export default AddHR;
