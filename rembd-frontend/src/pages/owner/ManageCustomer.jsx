import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import './ManageCustomer.css';

const ManageCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [flatNames, setFlatNames] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const token = Cookies.get('token');
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCustomers(res.data);
      setFilteredCustomers(res.data);

      const flats = {};
      await Promise.all(res.data.map(async (customer) => {
        if (customer.flat_id) {
          try {
            const flatRes = await axios.get(`http://localhost:8000/api/showflats/${customer.flat_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            flats[customer.flat_id] = flatRes.data.name;
          } catch {
            flats[customer.flat_id] = 'N/A';
          }
        }
      }));
      setFlatNames(flats);
    } catch {
      setMessage('❌ Failed to fetch customers.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedList = customers.filter(c => c.id !== id);
      setCustomers(updatedList);
      setFilteredCustomers(updatedList);
      setMessage('✅ Customer deleted successfully.');
    } catch {
      setMessage('❌ Failed to delete customer.');
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setEditForm({ ...customer });
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8000/api/customers/${editCustomer.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Customer updated successfully.');
      setShowModal(false);
      fetchCustomers();
    } catch {
      setMessage('❌ Failed to update customer.');
    }
  };

  const exportCustomersToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Customer Report', 105, 14, { align: 'center' });

    const tableData = customers.map((customer, index) => [
      index + 1,
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.status,
      customer.flat_id ? flatNames[customer.flat_id] || 'Loading' : 'No Flat',
    ]);

    autoTable(doc, {
      head: [['#', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Flat']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    doc.save(`Customer_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="manage-customer-container">
      <div className="header">
        <h2>Manage Customers</h2>
        <div className="header-buttons">
          <button className="home-btn" onClick={() => navigate('/company-admin')}>🏠 Home</button>
          <input
            type="text"
            className="search-bar"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
          />
          <button className="export-button" onClick={exportCustomersToPDF}>⬇ Export PDF</button>
        </div>
      </div>

      {message && <p className={message.includes('❌') ? 'error' : 'success'}>{message}</p>}

      <div className="customer-list">
        {currentCustomers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <h3>{customer.name}</h3>
            <p>Email: {customer.email}</p>
            <p>Phone: {customer.phone}</p>
            <p>Address: {customer.address}</p>
            <p>Status: {customer.status}</p>
            <p>Flat: {customer.flat_id ? flatNames[customer.flat_id] || 'Loading...' : 'No Flat Assigned'}</p>
            <div className="actions">
              <button onClick={() => openEditModal(customer)}>Edit</button>
              <button onClick={() => handleDelete(customer.id)} className="danger">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Customer</h3>
            <label>Name</label>
            <input name="name" value={editForm.name} onChange={handleEditChange} />
            <label>Phone</label>
            <input name="phone" value={editForm.phone} onChange={handleEditChange} />
            <label>Address</label>
            <input name="address" value={editForm.address} onChange={handleEditChange} />
            <label>Status</label>
            <select name="status" value={editForm.status} onChange={handleEditChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleEditSubmit}>Save</button>
              <button onClick={() => setShowModal(false)} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomer;
