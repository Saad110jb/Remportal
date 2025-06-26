import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddAttendence.css';
import { useNavigate } from 'react-router-dom';

const AddAttendence = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    status: 'present'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('❌ User not logged in.');
        return;
      }

      console.log('Fetching employees for user ID:', userId);

      const res = await axios.get('http://localhost:8000/api/employees', {
        headers: {
          'user_id': userId
        }
      });

      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('❌ Failed to load employees.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setError('❌ User not logged in.');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/attendances', {
        ...formData,
        user_id: userId
      });

      setMessage('✅ Attendance submitted successfully!');
      setTimeout(() => {
        navigate('/ManageAttendence');
      }, 1000);

      setFormData({ employee_id: '', date: '', status: 'present' });
    } catch (err) {
      console.error(err);
      setError('❌ Failed to submit attendance.');
    }
  };

  return (
    <div className="add-attendance-form">
      <h2>Mark Employee Attendance</h2>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Employee:</label>
        <select
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Employee --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Status:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>

        <button type="submit">📅 Submit Attendance</button>
      </form>
    </div>
  );
};

export default AddAttendence;
