import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Sidebar.css';

const SuperadminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('Company Management');
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/companies`),
          axios.get(`${API_BASE}/company-users`),
        ]);
        setCompanies(compRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (item, path) => {
    setActive(item);
    if (path) navigate(path);
  };

  // SVG Icons
  const BuildingIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const PuzzleIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 576 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 640 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const ChartIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const UsersIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 640 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor">
      <path d="..." />
    </svg>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif', fontSize: '1.2rem', color: '#555' }}>
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? '×' : '☰'}
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          <li className={active === 'Company Management' ? 'active' : ''} onClick={() => handleMenuClick('Company Management', '/company-management')}>
            <BuildingIcon /> Company Management
          </li>
          <li className={active === 'Add-on Management' ? 'active' : ''} onClick={() => handleMenuClick('Add-on Management', '/addon-management')}>
            <PuzzleIcon /> Add-on Management
          </li>
          <li className={active === 'Subscription Control' ? 'active' : ''} onClick={() => handleMenuClick('Subscription Control', '/subscription-control')}>
            <ShieldIcon /> Subscription Control
          </li>
         
          <li className={active === 'User Management' ? 'active' : ''} onClick={() => handleMenuClick('User Management', '/user-management')}>
            <UsersIcon /> User Management
          </li>
          <li className={active === 'Settings' ? 'active' : ''} onClick={() => handleMenuClick('Settings', '/dashboard-settings')}>
            <SettingsIcon /> Settings
          </li>
        </ul>
       
      </div>

      <div className={`content ${sidebarOpen ? 'open' : ''}`}>
        <h1 className="dashboard-title">{active}</h1>
        <div className="dashboard-content">
          <p>Welcome, Superadmin! Here’s an overview of your data:</p>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Companies</h3>
              <div className="stat-value">{companies.length}</div>
              <p>Active companies in the system.</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-value">{users.length}</div>
              <p>All registered company users.</p>
            </div>
            <div className="stat-card">
              <h3>Upcoming Renewals</h3>
              <div className="stat-value">
                {companies.filter((c) => {
                  const ends = new Date(c.subscription_ends_at);
                  const now = new Date();
                  const diff = (ends - now) / (1000 * 60 * 60 * 24);
                  return diff > 0 && diff <= 30;
                }).length}
              </div>
              <p>Renewals due within 30 days.</p>
            </div>
            <div className="stat-card">
              <h3>Expired Subscriptions</h3>
              <div className="stat-value">
                {companies.filter((c) => new Date(c.subscription_ends_at) < new Date()).length}
              </div>
              <p>Companies with expired plans.</p>
            </div>
          </div>

          <div className="content-section">
            <h2>Company List Snapshot</h2>
            <ul>
              {companies
                .filter(c => new Date(c.subscription_ends_at) < new Date())
                .slice(0, 5)
                .map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong> — Status: {c.status} — Ends:{' '}
                    {c.subscription_ends_at
                      ? new Date(c.subscription_ends_at).toLocaleDateString()
                      : 'N/A'}
                  </li>
                ))}
            </ul>
            <Link to="/company-list">
              <button className="btn btn-primary">View Full Company List</button>
            </Link>
          </div>

          <div className="content-section">
            <h2>User List Snapshot</h2>
            <ul>
              {users.slice(0, 5).map((u) => (
                <li key={u.id}>
                  {u.name} ({u.email}) — UID: {u.uid}
                </li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>Quick Actions</h2>
            <p>You can navigate to specific sections using the sidebar on the left.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
