// Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'tenant',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    'super_admin',
    'company_admin',
    'employee',
    'tenant',
    'owner',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      await axios.post('http://localhost:8000/api/register', formData);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      {success && <div className="success-message">{success}</div>}
      {errors.general && <div className="error-message">{errors.general}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group small">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            {errors.name && <div className="error-message">{errors.name[0]}</div>}
          </div>
          <div className="form-group small">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            {errors.email && <div className="error-message">{errors.email[0]}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          {errors.password && <div className="error-message">{errors.password[0]}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password_confirmation">Confirm Password</label>
          <input id="password_confirmation" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} placeholder="Repeat password" required />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            {roles.map(role => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}
          </select>
          {errors.role && <div className="error-message">{errors.role[0]}</div>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="redirect-text">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;