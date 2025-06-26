import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddonManagement.css';

const AddonManagement = () => {
  const [addons, setAddons] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    price: '',
    description: '',
    company_id: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('❌ Not authenticated');
      return;
    }
    fetchCompanies();
    fetchAddons();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data || []);
    } catch {
      setMessage('❌ Failed to load companies.');
    }
  };

  const fetchAddons = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/addons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = (res.data.addons || []).filter(
        (addon) => addon.name === 'chat-support'
      );
      setAddons(filtered);
    } catch {
      setMessage('❌ Failed to fetch addons.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      ...form,
      name: 'chat_support',
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/addons/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Chat Support addon updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/addons', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Chat Support addon added successfully');
      }

      setForm({ price: '', description: '', company_id: '' });
      setEditingId(null);
      fetchAddons();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to save chat support addon.');
    }
  };

  const handleEdit = (addon) => {
    setForm({
      price: addon.price,
      description: addon.description,
      company_id: addon.company_id || '',
    });
    setEditingId(addon.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this addon?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/addons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Chat Support addon deleted successfully');
      fetchAddons();
    } catch {
      setMessage('❌ Failed to delete chat support addon.');
    }
  };

  return (
    <div className="addon-management-container">
      <div className="addon-header">
        <h2>Chat Support Addon Management</h2>
        <button className="back-button" onClick={() => navigate('/super-admin-dashboard')}>
          🔙 Back
        </button>
      </div>

      {message && <p className={message.includes('❌') ? 'error' : 'success'}>{message}</p>}

      <form onSubmit={handleSubmit} className="addon-form">
        <input type="hidden" name="name" value="chat-support" />

        <input
          type="number"
          name="price"
          placeholder="Addon Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />
        <select name="company_id" value={form.company_id} onChange={handleChange} required>
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'} Chat Support</button>
      </form>

      <div className="addon-list">
        <h3>Existing Chat Support Addons</h3>
        {addons.length === 0 ? (
          <p>No chat-support addon found.</p>
        ) : (
          <ul>
            {addons.map((addon) => (
              <li key={addon.id} className="addon-item">
                <div>
                  <strong>{addon.name}</strong> — ${addon.price}
                  <p>{addon.description}</p>
                  <p><em>Company ID: {addon.company_id}</em></p>
                </div>
                <div className="addon-actions">
                  <button onClick={() => handleEdit(addon)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(addon.id)}>🗑️ Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddonManagement;
