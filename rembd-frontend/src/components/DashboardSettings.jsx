import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './DashboardSettings.css';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const DashboardSettings = () => {
  const navigate = useNavigate();
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(() => setErrorMsg('⚠️ Failed to verify user session.'));
  }, [navigate, token]);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Cookies.remove('token');
      navigate('/login');
    } catch (error) {
      setErrorMsg('❌ Logout failed.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (form.new_password !== form.new_password_confirmation) {
      setErrorMsg('❌ Password confirmation does not match.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/change-password`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg('✅ Password changed successfully.');
      setForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      const msg = err.response?.data?.message ||
                  err.response?.data?.error ||
                  JSON.stringify(err.response?.data?.errors) ||
                  '❌ Failed to change password.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard-settings ${darkMode ? 'dark' : ''}`}>
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <hr />

      <form onSubmit={handleChangePassword} className="password-form">
        <h4>🔐 Change Password</h4>
        <input
          type="password"
          placeholder="Current Password"
          ref={firstInputRef}
          value={form.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={form.new_password}
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={form.new_password_confirmation}
          onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
          required
        />
        <button type="submit" className="change-btn" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      <hr />

      <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>

      {successMsg && <p className="success">{successMsg}</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}
    </div>
  );
};

export default DashboardSettings;
