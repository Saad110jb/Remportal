import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CompanyManagement.css";

const API_BASE = "http://localhost:8000/api";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    months: 1,
  });

  const [adminForm, setAdminForm] = useState({
    uid: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address: "",
    national_id: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No auth token found. Please login.");
    } else {
      fetchCompanies();
    }
  }, [token]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
      setError("");
    } catch (err) {
      const msg = "Failed to fetch companies. Make sure you are logged in and token is valid.";
      setError(msg);
      alert(msg);
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: name === "months" ? Number(value) : value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const getCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (err) {
      console.error("Failed to fetch current user", err);
      alert("Error: Unable to fetch current user.");
      return null;
    }
  };

  const handleRegisterCompany = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (adminForm.password !== adminForm.password_confirmation) {
      const errMsg = "Password and confirmation do not match.";
      setError(errMsg);
      alert(errMsg);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("Unable to fetch current user");

      const registerPayload = {
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        password_confirmation: adminForm.password_confirmation,
        role: "company_admin",
        created_by: currentUser.id,
      };

      const registerRes = await axios.post(`${API_BASE}/register`, registerPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdUser = registerRes.data?.user;
      if (!createdUser?.id) throw new Error("User registration failed");

      const companyPayload = {
        company_name: companyForm.company_name,
        months: companyForm.months,
      };

      const companyRes = await axios.post(`${API_BASE}/register-company`, companyPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const company = companyRes.data?.company;
      if (!company?.id) throw new Error("Company registration failed");

      const companyAdminPayload = {
        uid: adminForm.uid,
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        password_confirmation: adminForm.password_confirmation,
        phone: adminForm.phone,
        address: adminForm.address,
        national_id: adminForm.national_id,
        company_id: company.id,
        user_id: createdUser.id,
      };

      await axios.post(`${API_BASE}/register-company-user`, companyAdminPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const successMsg = "Company, admin user, and account registered successfully.";
      setMessage(successMsg);
      alert(successMsg);

      setCompanyForm({ company_name: "", months: 1 });
      setAdminForm({
        uid: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        address: "",
        national_id: "",
      });
      fetchCompanies();
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data?.errors) ||
        err.message ||
        "Failed to register company or user.";
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleRenew = async (companyId) => {
    setMessage("");
    setError("");
    try {
      await axios.post(
        `${API_BASE}/renew-company-subscription`,
        {
          company_id: companyId,
          months: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const renewMsg = "Subscription renewed successfully.";
      setMessage(renewMsg);
      alert(renewMsg);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Subscription renewal failed.";
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="company-management">
      <h2>Company Management</h2>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleRegisterCompany} className="company-form">
        <h3>Register Company</h3>
        <div className="form-grid">
          <input
            type="text"
            name="company_name"
            value={companyForm.company_name}
            onChange={handleCompanyChange}
            placeholder="Company Name"
            required
          />
          <input
            type="number"
            name="months"
            value={companyForm.months}
            onChange={handleCompanyChange}
            placeholder="Subscription Months"
            min={1}
            required
          />
        </div>

        <h3>Admin Details</h3>
        <div className="form-grid">
          <input
            type="text"
            name="uid"
            value={adminForm.uid}
            onChange={handleAdminChange}
            placeholder="Admin UID"
            required
          />
          <input
            type="text"
            name="name"
            value={adminForm.name}
            onChange={handleAdminChange}
            placeholder="Admin Name"
            required
          />
          <input
            type="email"
            name="email"
            value={adminForm.email}
            onChange={handleAdminChange}
            placeholder="Admin Email"
            required
          />
          <input
            type="password"
            name="password"
            value={adminForm.password}
            onChange={handleAdminChange}
            placeholder="Password"
            required
          />
          <input
            type="password"
            name="password_confirmation"
            value={adminForm.password_confirmation}
            onChange={handleAdminChange}
            placeholder="Confirm Password"
            required
          />
          <input
            type="text"
            name="phone"
            value={adminForm.phone}
            onChange={handleAdminChange}
            placeholder="Admin Phone"
            required
          />
          <input
            type="text"
            name="national_id"
            value={adminForm.national_id}
            onChange={handleAdminChange}
            placeholder="Admin CNIC"
            required
          />
        </div>
        <textarea
          name="address"
          value={adminForm.address}
          onChange={handleAdminChange}
          placeholder="Admin Address"
          required
        ></textarea>

        <button type="submit">Register Company & Admin</button>
      </form>

      <h3>Companies List</h3>
      <ul>
        {companies.map((company) => (
          <li key={company.id}>
            {company.company_name} - Subscription valid until:{" "}
            {company.subscription_end_date}
            <button onClick={() => handleRenew(company.id)}>Renew Subscription</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyManagement;
