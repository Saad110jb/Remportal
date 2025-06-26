import React, { useState } from 'react';
import axios from 'axios';
import './AddEmployee.css';
import { useNavigate } from 'react-router-dom'; // ✅ Only this line added

const AddEmployee = () => {
  const navigate = useNavigate(); // ✅ Added to enable navigation

  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    department_id: '',
    designation: '',
    phone: '',
    email: '',
    emergency_contact: '',
    joining_date: '',
    salary: '',
    status: 'active',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/employees', formData);
      setMessage('✅ Employee added successfully!');
      setFormData({
        name: '',
        user_id: '',
        department_id: '',
        designation: '',
        phone: '',
        email: '',
        emergency_contact: '',
        joining_date: '',
        salary: '',
        status: 'active',
      });

      // ✅ Navigate to /EmployeeManagement after successful submission
      setTimeout(() => {
        navigate('/EmployeeManagement');
      }, 1000); // Optional delay for showing the success message
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add employee. Please check the inputs.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      user_id: '',
      department_id: '',
      designation: '',
      phone: '',
      email: '',
      emergency_contact: '',
      joining_date: '',
      salary: '',
      status: 'active',
    });
    setMessage('');
  };

  return (
    <div className="add-employee-form">
      <h2>Add New Employee</h2>

      {message && (
        <p className={`${message.startsWith('✅') ? 'success' : 'error'} full-width`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter employee name"
          required
        />

        <label>HR ID (User ID):</label>
        <input
          type="text"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          placeholder="Enter HR ID"
          required
        />

        <label>Department ID:</label>
        <input
          type="number"
          name="department_id"
          value={formData.department_id}
          onChange={handleChange}
          placeholder="Enter Department ID"
          required
        />

        <label>Designation:</label>
        <input type="text" name="designation" value={formData.designation} onChange={handleChange} />

        <label>Phone:</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Emergency Contact:</label>
        <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />

        <label>Joining Date:</label>
        <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />

        <label>Salary:</label>
        <input type="number" name="salary" value={formData.salary} onChange={handleChange} />

        <label>Status:</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="resigned">Resigned</option>
          <option value="terminated">Terminated</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Employee'}
        </button>

        <button type="button" className="clear-button" onClick={handleClear}>
          Clear Form
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
