import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './BillInfo.css';

const BillInfo = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 2;

  const token = Cookies.get('token');
  const navigate = useNavigate();

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axiosAuth.get('/my-bills');
        setBills(res.data.bills || []);
      } catch (err) {
        console.error('Error fetching bills:', err.response?.data || err.message);
        setError('Failed to load bills.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const filteredBills = bills.filter((bill) =>
    bill.description?.toLowerCase().includes(search.toLowerCase()) ||
    bill.lease?.id.toString().includes(search)
  );

  const indexOfLast = currentPage * billsPerPage;
  const indexOfFirst = indexOfLast - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Customer Bills Report', 14, 20);

    const rows = currentBills.map((bill) => [
      bill.id,
      bill.lease ? `Lease #${bill.lease.id}` : 'N/A',
      formatCurrency(bill.amount),
      formatDate(bill.due_date),
      bill.status,
      bill.description || '—',
      bill.creator?.name || '—',
    ]);

    doc.autoTable({
      startY: 30,
      head: [['ID', 'Lease', 'Amount', 'Due Date', 'Status', 'Description', 'Created By']],
      body: rows,
    });

    doc.save('bills_report.pdf');
  };

  return (
    <div className="bill-info-container">
      <div className="bill-info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Bills</h2>
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
        placeholder="Search by description or lease ID"
        className="search-bar"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading bills...</p>
      ) : currentBills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <>
          <button className="download-btn" onClick={generatePDF}>
            Download PDF
          </button>

          <table className="bill-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lease</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.lease ? `Lease #${bill.lease.id}` : 'N/A'}</td>
                  <td>{formatCurrency(bill.amount)}</td>
                  <td>{formatDate(bill.due_date)}</td>
                  <td>
                    <span className={`status-badge ${bill.status === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>{bill.description || '—'}</td>
                  <td>{bill.creator?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                className={currentPage === idx + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BillInfo;
