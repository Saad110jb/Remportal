import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf'; // ✅ import jsPDF
import './AddBill.css';

const AddBill = () => {
  const [formData, setFormData] = useState({
    customer_id: '',
    lease_id: '',
    amount: '',
    due_date: '',
    description: '',
  });

  const [customers, setCustomers] = useState([]);
  const [leases, setLeases] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = Cookies.get('token');

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axiosAuth.get('/filtered-customers');
        setCustomers(res.data.customers || []);
      } catch (err) {
        console.error('❌ Error fetching customers:', err);
        setError('Failed to load customers.');
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!formData.customer_id) {
        setLeases([]);
        return;
      }

      try {
        const res = await axiosAuth.get(`/leases/by-customer/${formData.customer_id}`);
        setLeases(res.data.leases || []);
      } catch (err) {
        console.error('❌ Error fetching leases:', err);
        setLeases([]);
      }
    };

    fetchLeases();
  }, [formData.customer_id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (e.target.name === 'customer_id') {
      setFormData(prev => ({ ...prev, lease_id: '' }));
    }
  };

const generateReceiptPDF = (bill) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text('Utility Bill Statement', 105, 20, { align: 'center' });

  // Section separator
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);

  // Info section
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Bill ID:`, 14, 32);
  doc.text(`${bill.id || 'N/A'}`, 50, 32);

  doc.text(`Lease ID:`, 14, 40);
  doc.text(`${bill.lease_id || 'N/A'}`, 50, 40);

  doc.text(`Amount Due:`, 14, 48);
  doc.text(`$${bill.amount}`, 50, 48);

  doc.text(`Due Date:`, 14, 56);
  doc.text(`${bill.due_date}`, 50, 56);

  doc.text(`Status:`, 14, 64);
  doc.text(`${bill.status || 'Unpaid'}`, 50, 64);

  // Line break
  doc.line(14, 70, 196, 70);

  // Description
  doc.setFont("helvetica", "bold");
  doc.text('Description:', 14, 78);
  doc.setFont("helvetica", "normal");
  doc.text(bill.description || 'No description provided.', 14, 84, { maxWidth: 180 });

  // Generation timestamp
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 105);

  // Signature line
  doc.setTextColor(0);
  doc.setFont("helvetica", "italic");
  doc.text('Authorized Signature:', 140, 130);
  doc.line(140, 132, 190, 132); // signature line

  // Footer line
  doc.setLineWidth(0.3);
  doc.line(14, 140, 196, 140);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("This is a system-generated bill. For queries, contact billing support.", 105, 146, { align: 'center' });

  doc.save(`Bill_Statement_${bill.id || Date.now()}.pdf`);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axiosAuth.post('/bills', formData);
      const bill = res.data.bill;

      setMessage('✅ Bill created successfully!');
      setFormData({
        customer_id: '',
        lease_id: '',
        amount: '',
        due_date: '',
        description: '',
      });
      setLeases([]);

      // ⬇️ Generate and download PDF receipt
      generateReceiptPDF(bill);

    } catch (err) {
      console.error('❌ Failed to create bill:', err.response?.data || err.message);
      setError('❌ Failed to create bill.');
    }
  };

  return (
    <div className="add-bill-container">
      <h2>Add New Bill</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Customer</label>
        <select name="customer_id" value={formData.customer_id} onChange={handleChange} required>
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>

        <label>Lease</label>
        <select name="lease_id" value={formData.lease_id} onChange={handleChange} disabled={!leases.length}>
          <option value="">Select Lease</option>
          {leases.map(lease => (
            <option key={lease.id} value={lease.id}>
              Lease #{lease.id} - {lease.property?.name || 'N/A'}
            </option>
          ))}
        </select>

        <label>Amount ($)</label>
        <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />

        <label>Due Date</label>
        <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

        <button type="submit">Create Bill</button>
      </form>
    </div>
  );
};

export default AddBill;
