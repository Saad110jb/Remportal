import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './ManageLease.css';

const ManageLease = () => {
  const [leases, setLeases] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leasesPerPage = 2;
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    axios
      .get('http://localhost:8000/api/leases-by-creator', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLeases(res.data.leases || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Something went wrong');
        setLoading(false);
      });
  }, []);

  const indexOfLastLease = currentPage * leasesPerPage;
  const indexOfFirstLease = indexOfLastLease - leasesPerPage;
  const currentLeases = leases.slice(indexOfFirstLease, indexOfLastLease);
  const totalPages = Math.ceil(leases.length / leasesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Leases Managed by You', 14, 20);

    const tableData = leases.map((lease) => [
      lease.customer?.name || 'N/A',
      lease.property?.name || 'N/A',
      lease.flat?.name || 'N/A',
      `$${lease.monthly_rent}`,
      lease.status,
      lease.start_date,
      lease.end_date || 'Ongoing',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Customer', 'Property', 'Flat', 'Rent', 'Status', 'Start', 'End']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [63, 81, 181] },
    });

    doc.save('manage_leases.pdf');
  };

  if (loading) return <div className="lease-loading">Loading leases...</div>;
  if (error) return <div className="lease-error">{error}</div>;

  return (
    <div className="manage-lease-container">
      <div className="top-controls">
        <button onClick={() => navigate('/owner-dashboard')} className="home-btn">🏠 Home Page</button>
        <button onClick={handleDownloadPDF} className="download-btn">📄 Download PDF</button>
      </div>

      <h2>Manage Your Leases</h2>

      <div className="lease-list">
        {currentLeases.map((lease) => (
          <div className="lease-card" key={lease.id}>
            <div><strong>Customer:</strong> {lease.customer?.name || 'N/A'}</div>
            <div><strong>Property:</strong> {lease.property?.name || 'N/A'}</div>
            <div><strong>Flat:</strong> {lease.flat?.name || 'N/A'}</div>
            <div><strong>Rent:</strong> ${lease.monthly_rent}</div>
            <div><strong>Status:</strong> {lease.status}</div>
            <div><strong>Start:</strong> {lease.start_date}</div>
            <div><strong>End:</strong> {lease.end_date || 'Ongoing'}</div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ManageLease;
