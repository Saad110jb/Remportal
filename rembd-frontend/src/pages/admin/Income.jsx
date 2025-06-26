import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './Income.css';

export const Income = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leasesPerPage = 2;
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    axios.get('http://localhost:8000/api/property-income', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Something went wrong');
        setLoading(false);
      });
  }, []);

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    if (data && currentPage < Math.ceil(data.leases.length / leasesPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text('Owner Income Summary', 14, 20);

    pdf.setFontSize(12);
    pdf.text(`Owner: ${data.owner}`, 14, 30);
    pdf.text(`Total Income: $${data.total_income}`, 14, 38);
    pdf.text(`Total Leases Created: ${data.lease_count}`, 14, 46);

    const tableData = data.leases.map(lease => [
      lease.property?.name || 'N/A',
      lease.flat?.name || 'N/A',
      lease.customer?.name || 'N/A',
      `$${lease.monthly_rent}`,
      lease.status,
    ]);

    autoTable(pdf, {
      startY: 56,
      head: [['Property', 'Flat', 'Customer', 'Rent', 'Status']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [67, 160, 71] },
    });

    pdf.save('income_summary.pdf');
  };

  if (loading) return <p className="loading">Loading income...</p>;
  if (error) return <p className="error">{error}</p>;

  const indexOfLast = currentPage * leasesPerPage;
  const indexOfFirst = indexOfLast - leasesPerPage;
  const currentLeases = data.leases.slice(indexOfFirst, indexOfLast);

  return (
    <div className="income-container">
      <div className="top-controls">
        <button onClick={() => navigate('/owner-dashboard')} className="home-btn">🏠 Home Page</button>
        <button onClick={handleDownloadPDF} className="download-btn">📄 Download PDF</button>
      </div>

      <div className="income-summary">
        <h2>Owner Income Summary</h2>
        <p><strong>Owner:</strong> {data.owner}</p>
        <p><strong>Total Income:</strong> ${data.total_income}</p>
        <p><strong>Total Leases Created:</strong> {data.lease_count}</p>
      </div>

      <h4 className="lease-title">Lease Details</h4>
      <div className="lease-list">
        {currentLeases.map((lease, idx) => (
          <div key={idx} className="lease-card">
            <div><strong>Property:</strong> {lease.property?.name || 'N/A'}</div>
            <div><strong>Flat:</strong> {lease.flat?.name || 'N/A'}</div>
            <div><strong>Customer:</strong> {lease.customer?.name || 'N/A'}</div>
            <div><strong>Rent:</strong> ${lease.monthly_rent}</div>
            <div><strong>Status:</strong> {lease.status}</div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>⟵ Prev</button>
        <span>Page {currentPage} of {Math.ceil(data.leases.length / leasesPerPage)}</span>
        <button onClick={handleNext} disabled={indexOfLast >= data.leases.length}>Next ⟶</button>
      </div>
    </div>
  );
};
