import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ManageAttendence.css';

const ManageAttendence = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const perPage = 3;
  const pageCount = Math.ceil(employees.length / perPage);
  const paginatedEmployees = employees.slice((page - 1) * perPage, page * perPage);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchAttendances();
  }, []);

  const fetchEmployees = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const res = await axios.get('http://localhost:8000/api/employees', {
        headers: { user_id: userId }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch employees');
    }
  };

  const fetchAttendances = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const res = await axios.get('http://localhost:8000/api/attendances', {
        headers: { user_id: userId }
      });
      setAttendances(res.data);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (id, name) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/attendances/employee/${id}`);
      setEmployeeAttendance(res.data);
      setSelectedEmployee({ id, name });
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to load attendance');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/attendances/${id}`);
      const updated = employeeAttendance.filter((a) => a.id !== id);
      setEmployeeAttendance(updated);
      fetchAttendances();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete attendance');
    }
  };

  const handleEditClick = (entry) => {
    setEditId(entry.id);
    setEditForm({ date: entry.date, status: entry.status });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/attendances/${id}`, editForm);
      alert('✅ Attendance updated successfully');
      setEditId(null);
      fetchEmployeeAttendance(selectedEmployee.id, selectedEmployee.name);
      fetchAttendances();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update attendance');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(`📋 Attendance Report: ${selectedEmployee?.name || ''}`, 14, 15);

    const tableColumn = ["ID", "Date", "Status"];
    const tableRows = employeeAttendance.map((a) => [
      a.id,
      a.date,
      a.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 9,
        cellPadding: 4,
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
      rowPageBreak: 'avoid',
    });

    doc.save(`${selectedEmployee?.name || 'employee'}_attendance.pdf`);
  };

  return (
    <div className="manage-attendance">
      <h2>Manage Attendance</h2>

      <div className="top-controls">
        <button className="home-btn" onClick={() => navigate('/employee-dashboard')}>
          🏠 Home Page
        </button>
        <button className="add-btn" onClick={() => navigate('/AddAttendence')}>
          ➕ Add Attendance
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => fetchEmployeeAttendance(emp.id, emp.name)}
                    >
                      👁 View All Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Attendance: {selectedEmployee?.name}</h3>
            <button className="close-btn" onClick={() => {
              setModalVisible(false);
              setEditId(null);
            }}>
              ✖ Close
            </button>

            <button className="download-btn" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>

            {employeeAttendance.length === 0 ? (
              <p>No attendance records available.</p>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAttendance.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      {editId === entry.id ? (
                        <>
                          <td>
                            <input
                              type="date"
                              name="date"
                              value={editForm.date}
                              onChange={handleEditChange}
                            />
                          </td>
                          <td>
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="leave">Leave</option>
                            </select>
                          </td>
                          <td>
                            <button className="save-btn" onClick={() => handleUpdate(entry.id)}>✅ Save</button>
                            <button className="cancel-btn" onClick={() => setEditId(null)}>❌ Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{entry.date}</td>
                          <td>{entry.status}</td>
                          <td>
                            <button className="edit-btn" onClick={() => handleEditClick(entry)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(entry.id)}>🗑️ Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAttendence;
