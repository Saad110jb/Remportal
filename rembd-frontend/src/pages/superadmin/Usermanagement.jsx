import React, { useState } from 'react';
import axios from 'axios';
import './UserManagement.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

function UserManagement() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee'
  });
  const navigate = useNavigate();
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setSubmitting(true);

    api.post('/register', formData)
      .then(() => {
        setSuccessMessage('User created successfully.');
        setSubmitting(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'employee'
        });
         setTimeout(() => navigate('/userlist'), 1000);
      })
      .catch(err => {
        setSubmitting(false);
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors || {});
        } else {
          setErrorMessage('Failed to create user.');
        }
      });
  };

  return (
    <div className="user-management-container">
      <h1 className="form-title">Add New User</h1>

      <form onSubmit={handleSubmit} className="user-form">
        {successMessage && <div className="success-msg">{successMessage}</div>}
        {errorMessage && <div className="error-msg">{errorMessage}</div>}

        {['name', 'email', 'password', 'password_confirmation'].map(field => (
          <div className="form-group" key={field}>
            <label>{field.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</label>
            <input
              type={field.includes('password') ? 'password' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors[field]?.map((err, idx) => (
              <p key={idx} className="error">{err}</p>
            ))}
          </div>
        ))}

        <div className="form-group">
          <label>Role</label>
          <select
  name="role"
  value={formData.role}
  onChange={handleChange}
  disabled={submitting}
>
  <option value="super_admin">Super Admin</option>
  <option value="company_admin">Company Admin</option>
  <option value="employee">Employee</option>
  <option value="tenant">Tenant</option>
  <option value="owner">Owner</option>
</select>

          {errors.role?.map((err, idx) => (
            <p key={idx} className="error">{err}</p>
          ))}
        </div>

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export default UserManagement;
