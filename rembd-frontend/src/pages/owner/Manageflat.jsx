import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ManageFlat.css';

const ManageFlat = () => {
  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFlat, setEditFlat] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/indexflats', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const data = res.data.data || res.data;
        setFlats(data);
        setFilteredFlats(data);
      } catch {
        setMessage('❌ Failed to fetch flats.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlats();
  }, [token]);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = flats.filter((flat) =>
      flat.name.toLowerCase().includes(lowerSearch) ||
      (flat.property?.name || '').toLowerCase().includes(lowerSearch) ||
      (flat.address || '').toLowerCase().includes(lowerSearch)
    );
    setFilteredFlats(filtered);
    setCurrentPage(1);
  }, [searchTerm, flats]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/deleteflats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setMessage('✅ Flat deleted successfully.');
      const updated = flats.filter((flat) => flat.id !== id);
      setFlats(updated);
      setFilteredFlats(updated);
    } catch {
      setMessage('❌ Failed to delete flat.');
    }
  };

  const openEditModal = (flat) => {
    setEditFlat(flat);
    setEditForm({ ...flat });
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8000/api/updateflats/${editFlat.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setMessage('✅ Flat updated successfully.');
      setShowModal(false);
      const res = await axios.get('http://localhost:8000/api/indexflats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data.data || res.data;
      setFlats(updated);
      setFilteredFlats(updated);
    } catch {
      setMessage('❌ Failed to update flat.');
    }
  };

  const exportFlatsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Flat Report', 105, 14, { align: 'center' });

    const tableData = flats.map((flat, index) => [
      index + 1,
      flat.name,
      flat.property?.name || 'N/A',
      flat.address,
      flat.type,
      flat.status,
      flat.bedrooms,
      flat.bathrooms,
      flat.size,
      flat.price,
      flat.is_running ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['#', 'Name', 'Property', 'Address', 'Type', 'Status', 'Bedrooms', 'Bathrooms', 'Size', 'Price', 'Running']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [46, 204, 113] },
    });

    doc.save(`Flats_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFlats = filteredFlats.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFlats.length / itemsPerPage);

  return (
    <div className="manage-flat-container">
      <h2>Manage Flats</h2>

      <div className="top-actions">
        <button className="home-btn" onClick={() => navigate('/company-admin')}>🏠 Home</button>
        <button className="add-flat-btn" onClick={() => navigate('/add-flat')}>➕ Add Flat</button>
        <button className="export-button" onClick={exportFlatsToPDF}>⬇ Export PDF</button>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by name, property or address..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {message && <p className={`flat-message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : currentFlats.length === 0 ? (
        <p>No flats found.</p>
      ) : (
        <div className="flat-list">
          {currentFlats.map((flat) => (
            <div key={flat.id} className="flat-card">
              <div className="flat-details">
                <strong>{flat.name}</strong>
                <p>Property: {flat.property?.name || 'N/A'}</p>
                <p>Address: {flat.address}</p>
                <p>Type: {flat.type} | Status: {flat.status}</p>
                <p>Bedrooms: {flat.bedrooms} | Bathrooms: {flat.bathrooms}</p>
                <p>Kitchen: {flat.kitchen} | Balcony: {flat.balcony}</p>
                <p>Size: {flat.size} sq ft | Price: Rs. {flat.price}</p>
                <p>Running: {flat.is_running ? 'Yes' : 'No'}</p>
              </div>
              <div className="flat-actions">
                <button onClick={() => openEditModal(flat)} className="edit-btn">✏️ Edit</button>
                <button onClick={() => handleDelete(flat.id)} className="delete-btn">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
      </div>

      {showModal && (
        <div className="modal-overlay1">
          <div className="modal-box1">
            <h3>Edit Flat</h3>
            <div className="row-form1">
              {[['name', 'Flat Name'], ['size', 'Size'], ['price', 'Price'], ['address', 'Address'], ['bedrooms', 'Bedrooms'], ['bathrooms', 'Bathrooms'], ['kitchen', 'Kitchen'], ['balcony', 'Balcony']].map(([field, label]) => (
                <div className="form-group2" key={field}>
                  <label>{label}</label>
                  <input
                    name={field}
                    type={['size', 'price', 'bedrooms', 'bathrooms', 'kitchen', 'balcony'].includes(field) ? 'number' : 'text'}
                    value={editForm[field] || ''}
                    onChange={handleEditChange}
                  />
                </div>
              ))}
              <div className="form-group2">
                <label>Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="form-group2">
                <label>Type</label>
                <select name="type" value={editForm.type} onChange={handleEditChange}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="form-group2">
                <label>Is Running</label>
                <select name="is_running" value={editForm.is_running} onChange={handleEditChange}>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
            <div className="modal-actions2">
              <button onClick={handleEditSubmit} className="save-btn">💾 Save</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFlat;
