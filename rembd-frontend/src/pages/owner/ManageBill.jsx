import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './ManageBill.css';

const ManageBill = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 3;

  const navigate = useNavigate();
  const token = Cookies.get('token');
  const userID = JSON.parse(localStorage.getItem('user_id'));

  useEffect(() => {
    if (!token || !userID) {
      navigate('/login');
      return;
    }
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/by-creator?created_by=${userID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBills(response.data.bills || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch bills.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills((prev) => prev.filter((bill) => bill.id !== id));
    } catch {
      alert('❌ Failed to delete bill.');
    }
  };

  const handleEditClick = (bill) => {
    setEditBill(bill);
    setShowPopup(true);
  };

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    setEditBill((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/api/bills/${editBill.id}`, editBill, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowPopup(false);
      fetchBills();
    } catch {
      alert('❌ Failed to update bill.');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const filteredBills = bills.filter((bill) =>
    bill.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * billsPerPage;
  const indexOfFirst = indexOfLast - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  return (
    <div className="manage-bill-container">
      <div className="top-bar">
        <h2>Manage Bills</h2>
        <div className="top-bar-buttons">
          <button className="home-btn" onClick={() => navigate('/company-admin')}>
            🏠 Home
          </button>
          <button className="add-bill-btn" onClick={() => navigate('/add-bill')}>
            + Add Bill
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading bills...</p>
      ) : currentBills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <>
          <table className="bill-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Lease</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{bill.customer?.name || 'N/A'}</td>
                  <td>{bill.lease ? `Lease #${bill.lease.id}` : 'N/A'}</td>
                  <td>{formatCurrency(bill.amount)}</td>
                  <td>{formatDate(bill.due_date)}</td>
                  <td>
                    <span
                      className={`status-badge ${bill.status === 'paid' ? 'status-paid' : 'status-unpaid'}`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td>{bill.description || '—'}</td>
                  <td>{formatDate(bill.created_at)}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(bill)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(bill.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(i + 1)}
                disabled={currentPage === i + 1}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {showPopup && editBill && (
        <div className="popup-backdrop">
          <div className="edit-bill-popup">
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              &times;
            </button>
            <h3>Edit Bill</h3>
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={editBill.amount}
              onChange={handlePopupChange}
            />
            <label>Due Date</label>
            <input
              type="date"
              name="due_date"
              value={editBill.due_date}
              onChange={handlePopupChange}
            />
            <label>Status</label>
            <select name="status" value={editBill.status} onChange={handlePopupChange}>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <label>Description</label>
            <textarea
              name="description"
              value={editBill.description}
              onChange={handlePopupChange}
            />
            <div className="popup-actions">
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBill;
