import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import './AddPayment.css';

const AddPayment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bill_id: '',
    flat_id: '',
    customer_id: '',
    amount: '',
    method: '',
    reference: '',
    description: '',
    payment_method: '',
    frequency: '',
  });

  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const token = Cookies.get('token');

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
      } catch (error) {
        console.error('Failed to fetch bills:', error);
      }
    };
    fetchBills();
  }, []);

  useEffect(() => {
    const fetchBillDetails = async () => {
      if (formData.bill_id) {
        try {
          const res = await axiosAuth.get(`/bills/${formData.bill_id}`);
          const bill = res.data.bill;
          if (bill) {
            setFormData((prev) => ({
              ...prev,
              customer_id: bill.customer_id || '',
              flat_id: bill.lease?.flat_id || '',
            }));
          }
        } catch (error) {
          console.error('Error fetching bill details:', error);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          customer_id: '',
          flat_id: '',
        }));
      }
    };
    fetchBillDetails();
  }, [formData.bill_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateReceiptPDF = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🏠 REM PORTAL', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Customer Payment Receipt', pageWidth / 2, 28, { align: 'center' });

    const startY = 35;
    const boxHeight = 115;
    doc.setDrawColor(180);
    doc.roundedRect(15, startY, pageWidth - 30, boxHeight, 3, 3);

    const entries = [
      ['Receipt No.', `#${Date.now().toString().slice(-6)}`],
      ['Bill ID', data.bill_id],
      ['Customer ID', data.customer_id],
      ['Flat ID', data.flat_id],
      ['Amount Paid', `${data.amount} PKR`],
      ['Method', data.method],
      ['Reference No.', data.reference || 'N/A'],
      ['Description', data.description || 'N/A'],
      ['Payment Method', data.payment_method],
      ['Frequency', data.frequency],
      ['Date Issued', new Date().toLocaleString()],
    ];

    let y = startY + 10;
    doc.setFontSize(12);
    doc.setTextColor(50);

    entries.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 22, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 70, y);
      y += 10;
    });

    doc.setDrawColor(160);
    doc.line(15, y + 5, pageWidth - 15, y + 5);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('This is a system-generated receipt. No signature required.', pageWidth / 2, y + 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('For any queries, contact support@decorent.pk', pageWidth / 2, y + 22, { align: 'center' });

    doc.save(`Payment_Receipt_${Date.now()}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    try {
      await axiosAuth.post('/payments', formData);
      setMessage('✅ Payment added successfully!');
      generateReceiptPDF(formData);
      setFormData({
        bill_id: '',
        flat_id: '',
        customer_id: '',
        amount: '',
        method: '',
        reference: '',
        description: '',
        payment_method: '',
        frequency: '',
      });

      setTimeout(() => navigate('/manage-payment'), 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage('❌ Something went wrong!');
      }
    }
  };

  return (
    <div className="add-payment-container">
      <h2>Add Payment</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* Bill ID */}
        <div className="form-field">
          <label>Bill ID</label>
          <select name="bill_id" value={formData.bill_id} onChange={handleChange}>
            <option value="">-- Select Bill --</option>
            {bills.map((bill) => (
              <option key={bill.id} value={bill.id}>
                {`Bill #${bill.id} - Amount: ${bill.amount}`}
              </option>
            ))}
          </select>
          {errors.bill_id && <span className="error">{errors.bill_id[0]}</span>}
        </div>

        {/* Customer ID */}
        <div className="form-field">
          <label>Customer ID</label>
          <input type="text" name="customer_id" value={formData.customer_id} readOnly />
        </div>

        {/* Flat ID */}
        <div className="form-field">
          <label>Flat ID</label>
          <input type="text" name="flat_id" value={formData.flat_id} readOnly />
        </div>

        {/* Amount */}
        <div className="form-field">
          <label>Amount</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
          {errors.amount && <span className="error">{errors.amount[0]}</span>}
        </div>

        {/* Method */}
        <div className="form-field">
          <label>Method</label>
          <select name="method" value={formData.method} onChange={handleChange}>
            <option value="">-- Select Method --</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="paypal">Paypal</option>
            <option value="check">Check</option>
          </select>
          {errors.method && <span className="error">{errors.method[0]}</span>}
        </div>

        {/* Reference */}
        <div className="form-field">
          <label>Reference</label>
          <input type="text" name="reference" value={formData.reference} onChange={handleChange} />
          {errors.reference && <span className="error">{errors.reference[0]}</span>}
        </div>

        {/* Description */}
        <div className="form-field full-width">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          {errors.description && <span className="error">{errors.description[0]}</span>}
        </div>

        {/* Payment Method */}
        <div className="form-field">
          <label>Payment Method</label>
          <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
            <option value="">-- Select Payment Method --</option>
            <option value="one_time">One-time</option>
            <option value="recurring">Recurring</option>
            <option value="installment">Installment</option>
          </select>
          {errors.payment_method && <span className="error">{errors.payment_method[0]}</span>}
        </div>

        {/* Frequency */}
        <div className="form-field">
          <label>Frequency</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="15 days">15 Days</option>
            <option value="1 month">1 Month</option>
            <option value="3 months">3 Months</option>
          </select>
          {errors.frequency && <span className="error">{errors.frequency[0]}</span>}
        </div>

        {/* Submit */}
        <div className="form-field full-width">
          <button type="submit" className="submit-btn">Add Payment</button>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
