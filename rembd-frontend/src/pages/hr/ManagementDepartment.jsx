import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ManagementDepartment.css';

const ManagementDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const res = await axios.get('http://localhost:8000/api/departments', {
        headers: { user_id: userId }
      });
      setDepartments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch departments.');
    } finally {
      setLoading(false);
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
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/departments/${id}`);
      const updated = filtered.filter(dep => dep.id !== id);
      setDepartments(updated);
      setFiltered(updated);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete department.');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const result = departments.filter(dep =>
      dep.name.toLowerCase().includes(value) ||
      dep.company?.name?.toLowerCase().includes(value) ||
      dep.head?.name?.toLowerCase().includes(value)
    );
    setFiltered(result);
  };

  const startEditing = (dep) => {
    setEditingId(dep.id);
    setEditedData({
      name: dep.name,
      head_id: dep.head?.id || '',
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const saveUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/departments/${id}`, editedData);
      alert('✅ Department updated successfully!');
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update department.');
    }
  };

  return (
    <div className="management-department">
      <h2>Department Management</h2>

      <div className="top-bar">
        <button className="home-btn" onClick={() => navigate('/employee-dashboard')}>
          🏠 Home Page
        </button>
        <input
          type="text"
          placeholder="🔍 Search by department, company, or head"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button className="add-department-btn" onClick={() => navigate('/AddDepartment')}>
          ➕ Add Department
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filtered.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <table className="department-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Company</th>
              <th>Department Head</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dep) => (
              <tr key={dep.id}>
                <td>{dep.id}</td>
                <td>
                  {editingId === dep.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleUpdateChange}
                      className="input-edit"
                    />
                  ) : (
                    dep.name
                  )}
                </td>
                <td>{dep.company?.name || 'N/A'}</td>
                <td>
                  {editingId === dep.id ? (
                    <select
                      name="head_id"
                      value={editedData.head_id}
                      onChange={handleUpdateChange}
                      className="select-edit"
                    >
                      <option value="">-- No Head --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    dep.head?.name || 'N/A'
                  )}
                </td>
                <td>
                  {editingId === dep.id ? (
                    <>
                      <button className="update-btn" onClick={() => saveUpdate(dep.id)}>💾 Save</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>❌ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="update-btn" onClick={() => startEditing(dep)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(dep.id)}>🗑️ Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagementDepartment;
