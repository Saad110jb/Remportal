import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './ManageOwner.css';

const ManageOwner = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const token = Cookies.get('token');
  const userId = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchOwners();
    } else {
      setError('❌ User not logged in');
      setLoading(false);
    }
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/users?created_by=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ownersOnly = response.data.users.filter(user => user.role === 'owner');
      setOwners(ownersOnly);
    } catch (err) {
      console.error('Failed to fetch owners', err);
      setError('❌ Failed to fetch owners');
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(search.toLowerCase()) ||
    owner.email.toLowerCase().includes(search.toLowerCase())
  );

  const visibleOwners = showAll ? filteredOwners : filteredOwners.slice(0, 2);

  return (
    <div className="manage-owner-container">
      <div className="header-row">
        <h2>Manage Owners</h2>
        <div>
          <button onClick={() => navigate('/company-admin')} className="home-button">
            🏠 Home
          </button>
          <button onClick={() => navigate('/add-owner')} className="add-owner-button">
            ➕ Add Owner
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && visibleOwners.length === 0 && (
        <p className="error-message">No owners found.</p>
      )}

      {visibleOwners.map((owner) => (
        <div key={owner.id} className="owner-card">
          <p><strong>Name:</strong> {owner.name}</p>
          <p><strong>Email:</strong> {owner.email}</p>
          <p><strong>Role:</strong> {owner.role}</p>
        </div>
      ))}

      {!showAll && filteredOwners.length > 2 && (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button onClick={() => setShowAll(true)} className="add-owner-button">
            Show All Owners
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageOwner;
