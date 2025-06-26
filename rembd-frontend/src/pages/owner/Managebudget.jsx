import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Managebudget.css';

const ManageBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [editBudget, setEditBudget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const token = Cookies.get('token');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
    } catch {
      setMessage('❌ Failed to fetch budgets.');
    }
  };

  const openEditModal = (budget) => {
    const formattedDate = budget.date.split('T')[0];
    setEditBudget(budget);
    setEditForm({
      type: budget.type,
      date: formattedDate,
      amount: budget.amount,
      category: budget.category || '',
      notes: budget.notes || '',
    });
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8000/api/budgets/${editBudget.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Budget updated successfully.');
      setShowModal(false);
      fetchBudgets();
    } catch {
      setMessage('❌ Failed to update budget.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      setMessage('✅ Budget deleted successfully.');
    } catch {
      setMessage('❌ Failed to delete budget.');
    }
  };

  const exportBudgetsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Budget Report', 105, 14, { align: 'center' });

    const tableData = budgets.map((budget, index) => [
      index + 1,
      budget.type.charAt(0).toUpperCase() + budget.type.slice(1),
      budget.date.split('T')[0],
      `Rs. ${budget.amount}`,
      budget.category || '-',
      budget.notes || '-',
      budget.company?.name || '-',
    ]);

    const totalAmount = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const avgAmount = budgets.length ? (totalAmount / budgets.length).toFixed(2) : 0;
    const numBudgets = budgets.length;

    const typeCounts = budgets.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(12);
    doc.text('Summary Analysis:', 14, 30);
    doc.setFontSize(10);
    doc.text(`• Total Budgets: ${numBudgets}`, 14, 36);
    doc.text(`• Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, 42);
    doc.text(`• Average per Budget: Rs. ${avgAmount}`, 14, 48);

    let y = 54;
    Object.entries(typeCounts).forEach(([type, count]) => {
      doc.text(`• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`, 14, y);
      y += 6;
    });

    autoTable(doc, {
      head: [['#', 'Type', 'Date', 'Amount', 'Category', 'Notes', 'Company']],
      body: tableData,
      startY: y + 4,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Budget_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBudgets = budgets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(budgets.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="manage-budget-container">
      <div className="header">
        <h2>Manage Budgets</h2>
        <div className="header-buttons">
          <button className="home-btn" onClick={() => navigate('/company-admin')}>🏠 Home</button>
          <button className="add-button" onClick={() => navigate('/add-budget')}>+ Add Budget</button>
          <button className="export-button" onClick={exportBudgetsToPDF}>⬇ Export PDF</button>
        </div>
      </div>

      {message && <p className={message.includes('❌') ? 'error' : 'success'}>{message}</p>}

      <div className="budget-list">
        {currentBudgets.map((budget) => (
          <div key={budget.id} className="budget-card">
            <h3>{budget.type.toUpperCase()} Budget</h3>
            <p><strong>Date:</strong> {budget.date.split('T')[0]}</p>
            <p><strong>Amount:</strong> Rs. {budget.amount}</p>
            {budget.category && <p><strong>Category:</strong> {budget.category}</p>}
            {budget.notes && <p><strong>Notes:</strong> {budget.notes}</p>}
            {budget.company && <p><strong>Company:</strong> {budget.company.name}</p>}
            <div className="actions">
              <button onClick={() => openEditModal(budget)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(budget.id)}>Delete</button>
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
            <h3>Edit Budget</h3>
            <label>Type</label>
            <select name="type" value={editForm.type} onChange={handleEditChange}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="half_yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>

            <label>Date</label>
            <input type="date" name="date" value={editForm.date} onChange={handleEditChange} />

            <label>Amount</label>
            <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} />

            <label>Category</label>
            <input type="text" name="category" value={editForm.category} onChange={handleEditChange} />

            <label>Notes</label>
            <textarea name="notes" value={editForm.notes} onChange={handleEditChange}></textarea>

            <div className="modal-actions">
              <button onClick={handleEditSubmit}>Save</button>
              <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBudget;
