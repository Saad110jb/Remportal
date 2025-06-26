// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const loginRes = await axios.post('http://localhost:8000/api/login', formData);
      const token = loginRes.data.access_token;

      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);

      const meRes = await axios.get('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const meData = meRes.data;
      const user = meData.user || meData;
      const role = meData.role || meData.user?.role;

      if (user?.id && role) {
        localStorage.setItem('user_id', user.id);
        navigateToDashboard(role);
      } else {
        setErrorMsg('User role or ID not found.');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrorMsg('Validation error.');
      } else if (err.response?.status === 401) {
        setErrorMsg('Invalid credentials.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToDashboard = (role) => {
    switch (role) {
      case 'super_admin':
        navigate('/super-admin-dashboard');
        break;
      case 'company_admin':
        navigate('/company-admin');
        break;
      case 'employee':
        navigate('/employee-dashboard');
        break;
      case 'tenant':
        navigate('/tenant-dashboard');
        break;
      case 'owner':
        navigate('/owner-dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div style={{ maxWidth: 400, margin: 'auto' }}>
        <h2>Login</h2>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label><br />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label>Password:</label><br />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register">
            <strong>Register</strong>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
