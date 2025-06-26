import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddNotice.css';

const AddNotice = () => {
  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    message: '',
    target_type: 'both',
    target_ids: [],
    expires_at: '',
  });

  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const token = Cookies.get('token');
  const userId = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate(); // 👈 ADD THIS

  useEffect(() => {
    if (userId) {
      fetchCompanies();
      fetchUsers();
    } else {
      setMessage('❌ Admin ID missing. Please log in again.');
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } catch {
      console.error('❌ Failed to fetch companies.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/users?created_by=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = res.data.users || [];
      setEmployees(allUsers.filter((u) => u.role === 'employee'));
      setCustomers(allUsers.filter((u) => u.role === 'tenant' || u.role === 'customer'));
    } catch {
      console.error('❌ Failed to fetch users.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors({});
    setMessage('');
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updated = checked
        ? [...prev.target_ids, parseInt(value)]
        : prev.target_ids.filter((id) => id !== parseInt(value));
      return { ...prev, target_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formatted = {
      ...formData,
      admin_id: userId,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    };

    try {
      await axios.post('http://localhost:8000/api/storenotices', formatted, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ Notice created and emails sent successfully!`);

      // 🔁 Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/notice-list');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      } else {
        setMessage('❌ Something went wrong.');
      }
    }
  };

  return (
    <div className="notice-form-container">
      <h2>Create Notice</h2>
      {message && (
        <p className={message.includes('❌') ? 'form-error' : 'form-success'}>
          {message}
        </p>
      )}

      <form className="notice-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Company</label>
            <select
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.company_id && <p className="form-error">{errors.company_id[0]}</p>}
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && <p className="form-error">{errors.title[0]}</p>}
          </div>

          <div className="form-group">
            <label>Expires At</label>
            <input
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          {errors.message && <p className="form-error">{errors.message[0]}</p>}
        </div>

        <div className="form-group">
          <label>Target Type</label>
          <select
            name="target_type"
            value={formData.target_type}
            onChange={handleChange}
            required
          >
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
            <option value="both">Both</option>
            <option value="specific">Specific</option>
          </select>
        </div>

        {formData.target_type === 'specific' && (
          <div className="user-selection">
            <label>Select Specific Users:</label>
            <div className="user-lists">
              <div className="user-group">
                <h4>Customers</h4>
                {customers.map((u) => (
                  <label key={u.id}>
                    <input
                      type="checkbox"
                      value={u.id}
                      checked={formData.target_ids.includes(u.id)}
                      onChange={handleCheckboxChange}
                    />
                    {u.name} ({u.email})
                  </label>
                ))}
              </div>
              <div className="user-group">
                <h4>Employees</h4>
                {employees.map((u) => (
                  <label key={u.id}>
                    <input
                      type="checkbox"
                      value={u.id}
                      checked={formData.target_ids.includes(u.id)}
                      onChange={handleCheckboxChange}
                    />
                    {u.name} ({u.email})
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <button type="submit">Send Notice</button>
      </form>
    </div>
  );
};

export default AddNotice;
