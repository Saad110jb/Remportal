import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserList.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchUsers = () => {
    api.get('/users')
      .then(res => {
        const userData = res.data?.users ?? [];
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          console.error("❌ Response 'users' is not an array");
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ API Error:", err);
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      api.delete(`/users/${id}`)
        .then(() => fetchUsers())
        .catch(err => console.error(err));
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditData({ name: '', email: '', role: '' });
  };

  const handleUpdate = (id) => {
    api.patch(`/users/${id}`, editData)
      .then(() => {
        fetchUsers();
        cancelEditing();
      })
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-list-container">
      <div className="header-row">
        <h2>User List</h2>
        <button className="back-button" onClick={() => navigate('/super-admin-dashboard')}>
          ← Back
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                return (
                  <tr key={user.id}>
                    {isEditing ? (
                      <>
                        <td><input name="name" value={editData.name} onChange={handleChange} /></td>
                        <td><input name="email" value={editData.email} onChange={handleChange} /></td>
                        <td>
                          <select name="role" value={editData.role} onChange={handleChange}>
                            <option value="super_admin">Super Admin</option>
                            <option value="company_admin">Company Admin</option>
                            <option value="employee">Employee</option>
                            <option value="tenant">Tenant</option>
                            <option value="owner">Owner</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => handleUpdate(user.id)}>Save</button>
                          <button onClick={cancelEditing}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button onClick={() => startEditing(user)}>Edit</button>
                          <button onClick={() => handleDelete(user.id)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4">No users found or invalid data format.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
