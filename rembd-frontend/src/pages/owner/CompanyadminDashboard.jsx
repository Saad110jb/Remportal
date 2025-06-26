import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompanyadminDashboard.css';

const CompanyadminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`admin-dashboard-container ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <h2>🏢 Company Admin Dashboard</h2>
        <div>
          <button className="menu-toggle" onClick={toggleMenu}>☰ Menu</button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="dashboard-menu">
          <Link to="/manage-property" className="dashboard-link">🏘 Manage Properties</Link>
          <Link to="/manage-flat" className="dashboard-link">🏢 Manage Flats</Link>
          <Link to="/manage-customer" className="dashboard-link">👥 Manage Customers</Link>
          <Link to="/manage-owner" className="dashboard-link">📝 Owners</Link>
          <Link to="/manage-budget" className="dashboard-link">💰 Manage Budgets</Link>
          <Link to="/manage-hr" className="dashboard-link">👔 Manage HR</Link>
          <Link to="/notice-list" className="dashboard-link">📢 View Notices</Link>
          <Link to="/manage-bill" className="dashboard-link">🧾 Manage Bill</Link>
          <Link to="/check-complain" className="dashboard-link">📢 Check Complains</Link>
          <button onClick={() => navigate('/dashboard-settings')} className="dashboard-link">
            ⚙️ Settings
          </button>
        </div>
      )}

      <p className="dashboard-description">
        Use the menu above to manage your properties, flats, customers, budgets, HR staff, billing, complaints and more.
      </p>
    </div>
  );
};

export default CompanyadminDashboard;
