import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeDashboard.css';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [userEmployee, setUserEmployee] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'user_id': userId,
        };

        const [empRes, deptRes] = await Promise.all([
          axios.get('http://localhost:8000/api/employees', { headers }),
          axios.get('http://localhost:8000/api/departments', { headers }),
        ]);

        const userEmployees = empRes.data;
        setEmployeeCount(userEmployees.length);

        const employee = userEmployees.find(
          (emp) => String(emp.user_id) === String(userId)
        );
        setUserEmployee(employee);

        const departments = userEmployees
          .map((emp) => emp.department?.id)
          .filter(Boolean);
        const uniqueDept = [...new Set(departments)];
        setDepartmentCount(uniqueDept.length);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchCounts();
  }, [token, userId]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="dashboard-wrapper">
      <button className="menu-button" onClick={toggleMenu}>☰ Menu</button>

      {menuOpen && (
        <div className="menu-dropdown">
          <ul>
            <li><a href="/employee-dashboard">🏠 Dashboard</a></li>
            <li><a href="/EmployeeManagement">👥 Manage Employees</a></li>
            <li><a href="/ManageAttendence">📅 Manage Attendance</a></li>
            <li><a href="/ManageDepartment">🏢 Manage Departments</a></li>
            <li><button onClick={() => navigate('/dashboard-settings')} className="settings-link">⚙️ Settings</button></li>
          </ul>
        </div>
      )}

      <div className="dashboard-content">
        <h1>Welcome to the Employee Dashboard</h1>
        <p className="dashboard-description">
          This panel gives you a quick overview of your company’s workforce and departments.
        </p>

        <div className="cards">
          <div className="card">
            <h3>Your Employee Records</h3>
            <p>{employeeCount}</p>
            <span className="card-note">Employees associated with your account.</span>
          </div>

          <div className="card">
            <h3>Your Departments</h3>
            <p>{departmentCount}</p>
            <span className="card-note">Unique departments linked to your profile.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
