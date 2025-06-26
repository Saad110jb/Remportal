// Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle, faStar, faUsers, faCrown, faUserTie, faUserMd,
  faBuilding, faUser, faHome, faFileContract, faCreditCard,
  faComments, faCommentDots, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="home-container">
      <header className="home-header">
        <img
          src="/image.jpeg"
          alt="REM Portal Logo"
          className="home-logo-image"
        />
        <h1 className="home-title">Welcome to REM Portal</h1>
        <p className="home-tagline">Your all-in-one Real Estate Management Solution</p>
      </header>

      <section className="home-section glass">
        <h2><FontAwesomeIcon icon={faInfoCircle} /> What is REM Portal?</h2>
        <div className="home-about">
          <div className="text">
            <p>REM Portal centralizes super admins, company admins, HR managers, property owners, and tenants in a sleek platform.</p>
            <p>Experience real-time analytics, automated workflows, and effortless stakeholder communication.</p>
          </div>
          <div className="image"><FontAwesomeIcon icon={faBuilding} /></div>
        </div>
      </section>

      <section className="home-section glass">
        <h2><FontAwesomeIcon icon={faStar} /> Key Features</h2>
        <div className="feature-grid">
          <FeatureCard icon={faUserTie} title="Role Dashboards" text="Custom UI per role" />
          <FeatureCard icon={faHome} title="Property Mgmt" text="Easy property & unit control" />
          <FeatureCard icon={faFileContract} title="Lease & Billing" text="Auto lease docs & invoices" />
          <FeatureCard icon={faCreditCard} title="Payments" text="Track & secure payments" />
          <FeatureCard icon={faComments} title="Complaints" text="Streamlined issue tracking" />
          <FeatureCard icon={faCommentDots} title="Chat" text="Chat groups" />
        </div>
      </section>

      <section className="home-section glass">
        <h2><FontAwesomeIcon icon={faUsers} /> Access Your Role</h2>
        <div className="role-grid">
          <RoleCard icon={faCrown} title="Superadmin" />
          <RoleCard icon={faUserTie} title="Company Admin" />
          <RoleCard icon={faUserMd} title="HR Manager" />
          <RoleCard icon={faUser} title="Tenant" />
          <RoleCard icon={faUser} title="Owner" />
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2025 REM Portal. All rights reserved.</p>
      </footer>

      {showScroll && (
        <button className="scroll-top" onClick={scrollTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, text }) => (
  <div className="card glass-hover">
    <div className="icon-bg"><FontAwesomeIcon icon={icon} /></div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

// 🆕 Updated RoleCard to make the whole card clickable
const RoleCard = ({ icon, title }) => (
  <Link to="/login" className="card role-card" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div className="role-icon"><FontAwesomeIcon icon={icon} /></div>
    <h3>{title}</h3>
    <div className="btn">Access</div>
  </Link>
);

export default Home;
