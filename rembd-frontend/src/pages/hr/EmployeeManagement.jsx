import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeeManagement = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'user_id': userId,
      };

      const res = await axios.get('http://localhost:8000/api/employees', { headers });
      setEmployees(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = employees.filter(emp => emp.id !== id);
      setEmployees(updated);
      setFiltered(updated);
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee.');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = employees.filter(emp =>
      emp.name?.toLowerCase().includes(value) ||
      emp.email?.toLowerCase().includes(value) ||
      emp.designation?.toLowerCase().includes(value)
    );
    setFiltered(filteredData);
    setCurrentPage(1);
  };

  const handleEditClick = (emp) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/employees/${id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedList = employees.map(emp =>
        emp.id === id ? { ...editForm } : emp
      );
      setEmployees(updatedList);
      setFiltered(updatedList);
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update employee.');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "ID", "Name", "Designation", "Email", "Phone",
      "Joining Date", "Status", "Department", "HR"
    ];

    const tableRows = filtered.map(emp => [
      emp.id,
      emp.name,
      emp.designation,
      emp.email,
      emp.phone,
      emp.joining_date,
      emp.status,
      emp.department?.name || "N/A",
      emp.user?.name || "N/A"
    ]);

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("📋 Employee Report", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 9,
        minCellHeight: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      bodyStyles: {
        textColor: 50,
      },
      margin: { top: 20, left: 10, right: 10 },
      tableLineColor: [44, 62, 80],
      tableLineWidth: 0.1,
    });

    doc.save("employee_report.pdf");
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  return (
    <div className="employee-management">
      <h2>Employee Management</h2>

      <div className="top-controls">
        <button className="home-btn" onClick={() => navigate('/employee-dashboard')}>
          🏠 Home Page
        </button>

        <button className="add-btn" onClick={() => navigate('/Addemployee')}>
          ➕ Add Employee
        </button>

        <button className="download-btn" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search by name, email, or designation"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filtered.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <table className="employee-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Department</th>
                <th>HR (User)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  {editingId === emp.id ? (
                    <>
                      <td><input type="text" name="name" value={editForm.name} onChange={handleEditChange} /></td>
                      <td><input type="text" name="designation" value={editForm.designation} onChange={handleEditChange} /></td>
                      <td><input type="email" name="email" value={editForm.email} onChange={handleEditChange} /></td>
                      <td><input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} /></td>
                      <td><input type="date" name="joining_date" value={editForm.joining_date} onChange={handleEditChange} /></td>
                      <td>
                        <select name="status" value={editForm.status} onChange={handleEditChange}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="resigned">Resigned</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </td>
                      <td>{emp.department?.name || 'N/A'}</td>
                      <td>{emp.user?.name || 'N/A'}</td>
                      <td>
                        <button className="update-btn" onClick={() => handleUpdateSubmit(emp.id)}>✅ Save</button>
                        <button className="delete-btn" onClick={() => setEditingId(null)}>❌ Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{emp.name}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.joining_date}</td>
                      <td>{emp.status}</td>
                      <td>{emp.department?.name || 'N/A'}</td>
                      <td>{emp.user?.name || 'N/A'}</td>
                      <td>
                        <button className="update-btn" onClick={() => handleEditClick(emp)}>✏️ Update</button>
                        <button className="delete-btn" onClick={() => handleDelete(emp.id)}>🗑️ Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={goToPrevPage} disabled={currentPage === 1}>⬅️ Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>Next ➡️</button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeManagement;
