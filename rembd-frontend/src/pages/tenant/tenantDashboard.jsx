import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FaMoneyCheckAlt,
  FaFileContract,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
  FaComments,
  FaCog
} from 'react-icons/fa';

const TenantDashboard = () => {
  const activeStyle = {
    fontWeight: '700',
    color: '#25D366',
    textDecoration: 'underline',
    backgroundColor: 'rgba(37, 211, 102, 0.25)',
    borderRadius: 12,
    padding: '10px 22px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
    letterSpacing: '0.05em',
  };

  const menuStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: 460,
    padding: '48px 36px',
    background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
    borderRight: '2px solid #25D366',
    height: '90vh',
    boxSizing: 'border-box',
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#1b3a1b',
    userSelect: 'none',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#25D366 #e8f5e9',
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 26,
    fontSize: 20,
    color: '#1a1a1a',
    textDecoration: 'none',
    padding: '12px 22px',
    borderRadius: 12,
    transition: 'background-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 0 0 transparent',
  };

  const linkHoverStyle = {
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    color: '#25D366',
    boxShadow: 'inset 0 0 12px 3px rgba(37, 211, 102, 0.3)',
  };

  const containerStyle = {
    display: 'flex',
    backgroundColor: '#f7faf7',
    height: '92vh',
    margin: '20px',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
  };

  const contentStyle = {
    flexGrow: 1,
    padding: 56,
    backgroundColor: '#fff',
    margin: 40,
    borderRadius: 24,
    boxShadow: '0 14px 40px rgba(0,0,0,0.07)',
    overflowY: 'auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: `repeating-radial-gradient(circle at 0 0, #d7edda 0, #d7edda 2px, transparent 2px, transparent 15px)`,
  };

  const headerStyle = {
    marginBottom: 18,
    color: '#2e7d32',
    fontWeight: '900',
    fontSize: 38,
    letterSpacing: '0.1em',
    textShadow: '0 1px 2px rgba(0,0,0,0.15)',
  };

  const descriptionStyle = {
    fontSize: 17,
    color: '#4a4a4a',
    lineHeight: 1.85,
    marginBottom: 40,
    borderLeft: '6px solid #25D366',
    paddingLeft: 20,
    fontStyle: 'italic',
    backgroundColor: 'rgba(196, 230, 198, 0.3)',
    borderRadius: 10,
    boxShadow: 'inset 2px 2px 8px rgba(37, 211, 102, 0.12)',
  };

  const menuItems = [
    { path: 'manage-payment', label: 'Manage Payment', icon: <FaMoneyCheckAlt size={20} /> },
    { path: 'lease-info', label: 'Lease Info', icon: <FaFileContract size={20} /> },
    { path: 'bill-info', label: 'Bill Info', icon: <FaFileInvoiceDollar size={20} /> },
    { path: 'manage-complain', label: 'Manage Complain', icon: <FaExclamationTriangle size={20} /> },
    { path: 'dashboard-settings', label: 'Settings', icon: <FaCog size={20} /> }, // ✅ New Settings Route
  ];

  const chatItem = { path: 'Chat-group', label: 'Chat Group', icon: <FaComments size={22} /> };

  return (
    <div style={containerStyle}>
      <nav style={menuStyle}>
        <h2 style={headerStyle}>Tenant Dashboard</h2>
        <p style={descriptionStyle}>
          Welcome to your Tenant Dashboard! Manage payments, leases, bills, complaints,
          and join community chats — all in one elegant, easy-to-use interface designed
          for your convenience and comfort.
        </p>

        {menuItems.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={`/${path}`}
            style={({ isActive }) =>
              isActive
                ? { ...linkStyle, ...activeStyle }
                : linkStyle
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                Object.assign(e.currentTarget.style, linkHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                Object.keys(linkHoverStyle).forEach(key => e.currentTarget.style[key] = '');
              }
            }}
          >
            {icon}
            {label}
          </NavLink>
        ))}

        <hr
          style={{
            margin: '36px 0',
            borderColor: '#25D366',
            opacity: 0.3,
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderRadius: '5px',
          }}
        />

        <NavLink
          to={`/${chatItem.path}`}
          style={({ isActive }) =>
            isActive
              ? { ...linkStyle, ...activeStyle }
              : linkStyle
          }
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              Object.assign(e.currentTarget.style, linkHoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              Object.keys(linkHoverStyle).forEach(key => e.currentTarget.style[key] = '');
            }
          }}
        >
          {chatItem.icon}
          {chatItem.label}
        </NavLink>
      </nav>

      <main style={contentStyle}>
        <Outlet />
      </main>
    </div>
  );
};

export default TenantDashboard;
