import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './NoticeList.css';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const noticesPerPage = 2;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = Cookies.get('token');
  const userId = JSON.parse(localStorage.getItem('user_id'));

  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchNotices();
    } else {
      setError('❌ Admin ID missing. Please log in again.');
      setLoading(false);
    }
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/shownotices?admin_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotices(response.data);
      setFilteredNotices(response.data);
    } catch (err) {
      setError('❌ Failed to fetch notices.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    const filtered = notices.filter((notice) =>
      notice.title.toUpperCase().includes(value)
    );
    setFilteredNotices(filtered);
    setCurrentPage(1);
  };

  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(filteredNotices.length / noticesPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="notice-list-container">
      <div className="notice-list-header">
        <h2>📢 Your Notices</h2>
        <div>
          <button className="home-btn" onClick={() => navigate('/company-admin')}>
            🏠 Home
          </button>
          <button className="add-notice-btn" onClick={() => navigate('/add-notice')}>
            ➕ Add Notice
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Title..."
        className="notice-search"
        value={searchTerm}
        onChange={handleSearch}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="notice-error">{error}</p>}

      {!loading && currentNotices.length === 0 && !error && (
        <p>No notices found.</p>
      )}

      <div className="notice-grid">
        {currentNotices.map((notice) => (
          <div className="notice-card" key={notice.id}>
            <h3>{notice.title}</h3>
            <p>{notice.message}</p>
            <div className="notice-meta">
              <span><strong>Company:</strong> {notice.company?.name || 'N/A'}</span>
              <span><strong>Target:</strong> {notice.target_type}</span>
              <span><strong>Created:</strong> {new Date(notice.created_at).toLocaleString()}</span>
              {notice.expires_at && (
                <span><strong>Expires:</strong> {new Date(notice.expires_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length > noticesPerPage && (
        <div className="pagination-controls">
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            ◀ Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeList;
