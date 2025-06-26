import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './AddComplaint.css';

const AddComplaint = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    status: 'pending',
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const token = Cookies.get('token');
  const userId = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'http://localhost:8000/api/storecomplaints',
        {
          ...formData,
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Complaint submitted successfully! An email has been sent to your company admin.');
      setFormData({ subject: '', description: '', status: 'pending' });

      // Redirect after 1 second
      setTimeout(() => {
        navigate('/manage-complain');
      }, 1000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      } else {
        setMessage('❌ Failed to submit complaint.');
      }
    }
  };

  return (
    <div className="add-complaint-container" style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Submit a Complaint</h2>
      {message && <p style={{ color: message.includes('❌') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Subject</label><br />
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
          {errors.subject && <p style={{ color: 'red' }}>{errors.subject[0]}</p>}
        </div>

        <div>
          <label>Description</label><br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          {errors.description && <p style={{ color: 'red' }}>{errors.description[0]}</p>}
        </div>

        <div>
          <label>Status</label><br />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
};

export default AddComplaint;
