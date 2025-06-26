import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    
    {
      title: '📝 Add Lease',
      subtitle: 'Assign a new lease to tenants',
      path: '/add-lease',
    },
    {
      title: '💰 Income Info',
      subtitle: 'Track your property earnings',
      path: '/incomeinfo',
    },
    {
      title: '📋 Manage Lease',
      subtitle: 'View and manage your leases',
      path: '/manage-lease',
    },
    {
      title: '⚙️ Dashboard Settings',
      subtitle: 'Change password or logout',
      path: '/dashboard-settings',
    },
  ];

  return (
    <div className="owner-dashboard-container">
      <h2>Welcome, Owner</h2>
      <p className="subtitle">Manage your properties, leases, and income efficiently</p>

      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(card.path)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(card.path)}
          >
            <h3>{card.title}</h3>
            <p>{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
