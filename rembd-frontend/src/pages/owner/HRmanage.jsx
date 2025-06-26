import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './HRManage.css';

const HRManage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const token = Cookies.get('token');
  const userId = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/users?created_by=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.users);
      setFilteredUsers(res.data.users);
    } catch (err) {
      setError('❌ Failed to fetch HR users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="hr-manage-container" style={{ maxWidth: '850px', margin: 'auto' }}>
      <div className="hr-header">
        <h2>Manage HR Users</h2>
        <div className="hr-header-buttons">
          <button onClick={() => navigate('/company-admin')} className="home-btn">
            🏠 Home
          </button>
          <button className="add-hr-button" onClick={() => navigate('/add-hr')}>
            ➕ Add HR
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={handleSearchChange}
        className="search-bar"
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p>No HR users found.</p>
      ) : (
        <>
          <table className="hr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>HR</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HRManage;
