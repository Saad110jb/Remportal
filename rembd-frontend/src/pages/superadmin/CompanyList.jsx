import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CompanyList.css';

const CompanyList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const [companyPage, setCompanyPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 5;

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form, setForm] = useState({ months: 1 });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companyRes, userRes] = await Promise.all([
        axios.get('http://localhost:8000/api/companies'),
        axios.get('http://localhost:8000/api/company-users'),
      ]);
      setCompanies(Array.isArray(companyRes.data) ? companyRes.data : []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCompanySearch = (e) => {
    setCompanySearch(e.target.value);
    setCompanyPage(1);
  };

  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
    setUserPage(1);
  };

  const openRenewModal = (company) => {
    setEditingCompany(company);
    setForm({ months: 1 });
    setShowCompanyModal(true);
  };

  const openDeleteModal = (type, id) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    const { type, id } = deleteTarget;
    try {
      if (type === 'company') {
        await axios.delete(`http://localhost:8000/api/companies/${id}`);
      } else if (type === 'user') {
        await axios.delete(`http://localhost:8000/api/users/${id}`);
      }
      fetchData();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/renew-company-subscription', {
        company_id: editingCompany.id,
        months: form.months,
      });
      setShowCompanyModal(false);
      fetchData();
    } catch (err) {
      console.error('Renew failed:', err);
    }
  };

  const filteredCompanies = companies.filter(
    (c) => c.name && c.name.toLowerCase().includes(companySearch.trim().toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) => u.name && u.name.toLowerCase().includes(userSearch.trim().toLowerCase())
  );

  const paginatedCompanies = filteredCompanies.slice(
    (companyPage - 1) * itemsPerPage,
    companyPage * itemsPerPage
  );

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  );

  const totalCompanyPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="company-list-container">
      <button className="back-button" onClick={() => navigate('/super-admin-dashboard')}>
        ← Back
      </button>
      <h2>Company & User Snapshot</h2>

      <div className="lists-wrapper">
        {/* Users Section */}
        <div className="list-section users-section">
          <h3>Company Users</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={handleUserSearch}
            className="search-input"
          />
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company ID</th>
                <th>Address</th>
                <th>National ID</th>

              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.company_id}</td>
                    <td>{user.address}</td>
                    <td>{user.national_id}</td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No matching users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => setUserPage(Math.max(userPage - 1, 1))} disabled={userPage === 1}>Previous</button>
            <span>Page {userPage} of {totalUserPages}</span>
            <button onClick={() => setUserPage(Math.min(userPage + 1, totalUserPages))} disabled={userPage === totalUserPages}>Next</button>
          </div>
        </div>

        {/* Companies Section */}
        <div className="list-section companies-section">
          <h3>Companies</h3>
          <input
            type="text"
            placeholder="Search companies..."
            value={companySearch}
            onChange={handleCompanySearch}
            className="search-input"
          />
          <table>
            <thead>
              <tr>
                <th>Company ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Subscription Ends</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{company.status}</td>
                    <td>{company.subscription_ends_at ? new Date(company.subscription_ends_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="renew-company-btn" onClick={() => openRenewModal(company)}>Renew</button>
                      <button className="delete-company-btn" onClick={() => openDeleteModal('company', company.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No matching companies found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => setCompanyPage(Math.max(companyPage - 1, 1))} disabled={companyPage === 1}>Previous</button>
            <span>Page {companyPage} of {totalCompanyPages}</span>
            <button onClick={() => setCompanyPage(Math.min(companyPage + 1, totalCompanyPages))} disabled={companyPage === totalCompanyPages}>Next</button>
          </div>
        </div>
      </div>

      {/* Company Renew Modal */}
      {showCompanyModal && (
        <div className="company-modal-overlay">
          <div className="company-modal-content">
            <h3>Renew Company: {editingCompany?.name}</h3>
            <form onSubmit={handleRenewSubmit}>
              <input
                type="number"
                name="months"
                value={form.months}
                onChange={handleFormChange}
                min="1"
                required
                className="renew-months-input"
              />
              <div className="company-modal-actions">
                <button type="submit">Renew</button>
                <button type="button" onClick={() => setShowCompanyModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this {deleteTarget.type}?</p>
            <div className="delete-modal-actions">
              <button className="confirm-delete-btn" onClick={handleDeleteConfirmed}>Yes, Delete</button>
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
