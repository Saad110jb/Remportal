// src/pages/ManagePayment.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './ManagePayment.css';
import { useNavigate } from 'react-router-dom';

const ManagePayment = () => {
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 2;
  const navigate = useNavigate();

  const token = Cookies.get('token');
  const axiosAuth = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        const meRes = await axiosAuth.get('/me');
        const currentUser = meRes.data.user;

        const creatorId = currentUser.created_by;
        const currentEmail = currentUser.email;

        if (!creatorId) {
          setError('This user has no creator (created_by is null).');
          return;
        }

        const customerRes = await axiosAuth.get(`/filtered-customers?user_id=${creatorId}`);
        const customers = customerRes.data.customers || [];

        const matchedCustomer = customers.find(c => c.email === currentEmail);

        if (!matchedCustomer) {
          setError('No customer found for this user.');
          return;
        }

        setCustomer(matchedCustomer);

        const paymentsRes = await axiosAuth.get(`/indexpayments?customer_id=${matchedCustomer.id}`);
        const paymentList = paymentsRes.data.payments || [];

        setPayments(paymentList);
        setFilteredPayments(paymentList);
      } catch (err) {
        const errData = err.response?.data || err.message;
        setError(errData?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const filtered = payments.filter(payment =>
      payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.amount).includes(searchTerm)
    );
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchTerm, payments]);

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="status-message">Loading...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="manage-payment-container">
      <div className="header">
        <h2>My Payments</h2>
        <div className="header-buttons">
          <button className="home-button" onClick={() => navigate('/tenant-dashboard')}>🏠 Home</button>
          <button className="add-payment-button" onClick={() => navigate('/add-payment')}>+ Add Payment</button>
        </div>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search by amount or method..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {customer && (
        <div className="customer-info">
          <h3>Customer Info</h3>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
        </div>
      )}

      <h3>Payments</h3>
      <div className="table-wrapper">
        {currentPayments.length > 0 ? (
          <>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.method}</td>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={currentPage === i + 1 ? 'active' : ''}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p>No payments found.</p>
        )}
      </div>
    </div>
  );
};

export default ManagePayment;
