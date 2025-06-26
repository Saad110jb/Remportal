import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './LeaseInfo.css';

const LeaseInfo = () => {
  const [leases, setLeases] = useState([]);
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leasesPerPage = 2;

  const token = Cookies.get('token');
  const navigate = useNavigate();

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await axiosAuth.get('/leases/by-creator-user');
        const data = response.data.leases || [];
        setLeases(data);
        setFilteredLeases(data);
      } catch (err) {
        setError('Failed to fetch lease data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = leases.filter(lease =>
      lease.property?.name?.toLowerCase().includes(value)
    );
    setFilteredLeases(filtered);
    setCurrentPage(1);
  };

  const indexOfLastLease = currentPage * leasesPerPage;
  const indexOfFirstLease = indexOfLastLease - leasesPerPage;
  const currentLeases = filteredLeases.slice(indexOfFirstLease, indexOfLastLease);
  const totalPages = Math.ceil(filteredLeases.length / leasesPerPage);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lease Report', 14, 20);

    const rows = currentLeases.map((lease) => [
      lease.id,
      lease.property?.name || 'N/A',
      lease.flat?.name || 'N/A',
      lease.start_date,
      lease.end_date || 'N/A',
      `Rs. ${lease.monthly_rent}`,
      lease.status,
    ]);

    doc.autoTable({
      startY: 30,
      head: [['ID', 'Property', 'Flat', 'Start Date', 'End Date', 'Rent', 'Status']],
      body: rows,
    });

    doc.save('lease_report.pdf');
  };

  return (
    <div className="add-lease-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Lease Information</h2>
        <button
          onClick={() => navigate('/tenant-dashboard')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🏠 Home
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by Property Name..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <button className="download-btn" onClick={generatePDF}>
        Download PDF
      </button>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && currentLeases.length === 0 && (
        <p>No leases found for your customer account.</p>
      )}

      {currentLeases.map((lease, idx) => (
        <div key={lease.id} className="lease-card">
          <h4>#{indexOfFirstLease + idx + 1} — Lease ID: {lease.id}</h4>
          <p><strong>Property:</strong> {lease.property?.name || 'N/A'}</p>
          <p><strong>Flat:</strong> {lease.flat?.name || 'N/A'}</p>
          <p><strong>Start:</strong> {lease.start_date}</p>
          <p><strong>End:</strong> {lease.end_date || 'N/A'}</p>
          <p><strong>Rent:</strong> Rs. {lease.monthly_rent}</p>
          <p><strong>Status:</strong> {lease.status}</p>
        </div>
      ))}

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaseInfo;
