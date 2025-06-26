import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ManageProperty.css';

const ManageProperty = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  const fetchProperties = async () => {
    const token = Cookies.get('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      setMessage('❌ Missing authentication. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/api/indexproperties?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(res.data);
      setFilteredProperties(res.data);
      if (res.data.length === 0) setMessage('ℹ️ No properties found for this user.');
    } catch (err) {
      setMessage('❌ Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const lowerSearch = searchQuery.toLowerCase();
    const filtered = properties.filter((property) =>
      property.name?.toLowerCase().includes(lowerSearch) ||
      property.location?.toLowerCase().includes(lowerSearch) ||
      property.status?.toLowerCase().includes(lowerSearch)
    );
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchQuery, properties]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`http://localhost:8000/api/deleteproperties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Property deleted successfully.');
      fetchProperties();
    } catch (err) {
      setMessage('❌ Failed to delete property.');
    }
  };

  const handleEdit = (property) => {
    setEditData({
      id: property.id,
      name: property.name || '',
      description: property.description || '',
      location: property.location || '',
      price: property.price || '',
      status: property.status || 'available',
      property_for: property.property_for || 'sale',
      type: property.type || 'commercial',
      is_running: property.is_running || 0,
    });
  };

  const handleUpdate = async () => {
    const token = Cookies.get('token');
    const { id, name, description, location, price, status, property_for, type, is_running } = editData;

    try {
      await axios.put(`http://localhost:8000/api/updateproperties/${id}`, {
        name, description, location, price, status, property_for, type, is_running,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('✅ Property updated successfully.');
      setEditData(null);
      fetchProperties();
    } catch (err) {
      setMessage('❌ Failed to update property.');
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Property Report', 105, 14, { align: 'center' });

    const tableData = filteredProperties.map((p) => [
      p.id, p.name, p.location, p.price, p.status, p.property_for, p.type, p.is_running ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['ID', 'Name', 'Location', 'Price', 'Status', 'For', 'Type', 'Running']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Property_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedItems = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="manage-property-container">
      <h2>My Properties</h2>

      <div className="top-actions">
        <button className="home-btn" onClick={() => navigate('/company-admin')}>🏠 Home Page</button>
        <button className="add-property-btn" onClick={() => navigate('/add-property')}>➕ Add Property</button>
        <button className="export-btn" onClick={exportToPDF}>⬇ Export PDF</button>
      </div>

      <input
        type="text"
        placeholder="Search by name, location, or status"
        className="search-bar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? <p>Loading...</p> : <p className="message">{message}</p>}

      <table className="property-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>For</th>
            <th>Type</th>
            <th>Running</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((property) => (
            <tr key={property.id}>
              <td>{property.id}</td>
              <td>{property.name}</td>
              <td>{property.location}</td>
              <td>{property.price}</td>
              <td>{property.status}</td>
              <td>{property.property_for}</td>
              <td>{property.type}</td>
              <td>{property.is_running ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(property)} className="edit-btn">✏️</button>
                <button onClick={() => handleDelete(property.id)} className="delete-btn">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}

      {editData && (
        <div className="popup">
          <div className="popup-inner">
            <h3>Edit Property</h3>

            <label htmlFor="name">Property Name</label>
            <input id="name" name="name" value={editData.name} onChange={handleChange} />

            <label htmlFor="location">Location</label>
            <input id="location" name="location" value={editData.location} onChange={handleChange} />

            <label htmlFor="price">Price</label>
            <input id="price" name="price" type="number" value={editData.price} onChange={handleChange} />

            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={editData.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>

            <label htmlFor="property_for">Property For</label>
            <select id="property_for" name="property_for" value={editData.property_for} onChange={handleChange}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>

            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={editData.type} onChange={handleChange}>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
            </select>

            <label htmlFor="is_running">Is Running</label>
            <select id="is_running" name="is_running" value={editData.is_running} onChange={handleChange}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>

            <div className="popup-buttons">
              <button onClick={handleUpdate} className="save-btn">✅ Save</button>
              <button onClick={() => setEditData(null)} className="cancel-btn">❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperty;
