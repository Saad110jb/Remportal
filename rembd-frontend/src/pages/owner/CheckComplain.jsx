import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './CheckComplain.css';

const CheckComplain = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const token = Cookies.get('token');
  const loggedInUserId = JSON.parse(localStorage.getItem('user_id'));
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedInUserId) fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/indexcomplaints', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data.complaints.filter(
        (comp) => comp.user?.created_by === loggedInUserId
      );

      setComplaints(filtered);
    } catch (err) {
      console.error('❌ Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8000/api/updatecomplaints/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = complaints.map((comp) =>
        comp.id === id ? { ...comp, status: newStatus } : comp
      );
      setComplaints(updated);
    } catch {
      alert('❌ Failed to update status');
    }
  };

  const visibleComplaints = showAll
    ? complaints
    : complaints.slice(-2);

  return (
    <div className="check-complain-container" style={{ maxWidth: '900px', margin: 'auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Complaints Sent by Your Customers</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/company-admin')} className="home-button">
            🏠 Home
          </button>
          <button onClick={() => navigate('/add-notice')} className="add-notice-button">
            ➕ Add Notice
          </button>
        </div>
      </div>

      <p style={{ marginBottom: '20px', color: '#666', fontSize: '15px' }}>
        Only the latest 2 complaints are shown below.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : visibleComplaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <>
          <ul>
            {visibleComplaints.map((comp) => (
              <li key={comp.id} className="complaint-item">
                <strong>{comp.subject}</strong><br />
                <span>{comp.description}</span><br />
                <small>By: {comp.user?.name || 'Unknown'}</small><br />

                <label>Status: </label>
                <select
                  value={comp.status}
                  onChange={(e) => handleStatusChange(comp.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </li>
            ))}
          </ul>

          {!showAll && complaints.length > 2 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setShowAll(true)} className="add-notice-button">
                Show All Complaints
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CheckComplain;
