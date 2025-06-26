import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './ManageComplain.css'; // Optional styling file

export const ManageComplain = () => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');
  const navigate = useNavigate();

  const fetchComplaints = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/indexcomplaints?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.complaints.slice(0, 2)); // limit to 2
    } catch (err) {
      console.error('❌ Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints(search);
  };

  return (
    <div className="manage-complain-container" style={{ maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Latest Complaints (2 Only)</h2>
        <button onClick={() => navigate('/tenant-dashboard')} style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px' }}>
          🏠 Home
        </button>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search by subject or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ marginRight: '10px' }}>Search</button>
        <button type="button" onClick={() => navigate('/add-complain')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px' }}>
          ➕ Add Complaint
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <ul>
          {complaints.map((comp) => (
            <li key={comp.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
              <strong>{comp.subject}</strong><br />
              {comp.description}<br />
              <small>Status: {comp.status}</small><br />
              <small>By: {comp.user?.name || 'Unknown'}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
