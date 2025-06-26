import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddDepartment.css';

const AddDepartment = () => {
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    head_id: '',
  });

  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
    fetchEmployees();
  }, []);

  const fetchCompanies = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const res = await axios.get('http://localhost:8000/api/companies', {
        headers: { user_id: userId }
      });
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const res = await axios.get('http://localhost:8000/api/employees', {
        headers: { user_id: userId }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const userId = localStorage.getItem('user_id');
      const payload = {
        ...formData,
        head_id: formData.head_id === '' ? null : formData.head_id, // Ensure null is sent if empty
        company_id: formData.company_id === '' ? null : formData.company_id,
      };

      await axios.post('http://localhost:8000/api/departments', payload, {
        headers: { user_id: userId }
      });

      setMessage('✅ Department added successfully!');
      setTimeout(() => {
        navigate('/ManageDepartment');
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setMessage(`❌ ${err.response.data.error}`);
      } else {
        setMessage('❌ Failed to add department.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-department-container">
      <h2>Add Department</h2>

      {message && (
        <p className={`msg ${message.startsWith('✅') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="department-form">
        <label>Department Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter department name"
          required
        />

        <label>Company:</label>
        <select
          name="company_id"
          value={formData.company_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <label>Department Head (Optional):</label>
        <select name="head_id" value={formData.head_id} onChange={handleChange}>
          <option value="">-- None (Optional) --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        <small className="note">⚠️ You can leave this empty if assigning head later.</small>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Department'}
        </button>
      </form>
    </div>
  );
};

export default AddDepartment;
