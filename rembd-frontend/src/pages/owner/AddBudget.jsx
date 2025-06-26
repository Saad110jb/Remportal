import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddBudget.css'; // optional: for styling

const AddBudget = () => {
  const [formData, setFormData] = useState({
    company_id: '',
    type: 'monthly',
    date: '',
    amount: '',
    category: '',
    notes: '',
  });

  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } catch {
      setMessage('❌ Failed to load companies.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('http://localhost:8000/api/budgets', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Budget added successfully!');
      // Redirect to /manage-budget after 1 second
      setTimeout(() => {
        navigate('/manage-budget');
      }, 1000);
    } catch (error) {
      setMessage('❌ Failed to add budget. Please check the inputs.');
    }
  };

  return (
    <div className="add-budget-container">
      <h2>Add Budget</h2>
      {message && <p className={message.includes('❌') ? 'error' : 'success'}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Company</label>
          <select name="company_id" value={formData.company_id} onChange={handleChange}>
            <option value="">-- Select Company --</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="half_yearly">Half-Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div>
          <label>Amount</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
        </div>

        <div>
          <label>Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} />
        </div>

        <div>
          <label>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
        </div>

        <button type="submit">Add Budget</button>
      </form>
    </div>
  );
};

export default AddBudget;
