import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './SubscriptionPlan.css';

const SubscriptionPlan = () => {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [plan, setPlan] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [message, setMessage] = useState('');
  const token = Cookies.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('❌ Not authenticated');
      return;
    }
    fetchCompanies();
  }, [token]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Fetch companies error:', err);
      setMessage('❌ Failed to load companies.');
    }
  };

  const fetchAddons = async (cid) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/addons?company_id=${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddons(res.data.addons || []);
    } catch (err) {
      console.error('Fetch addons error:', err);
      setMessage('❌ Failed to load addons.');
    }
  };

  const checkAndExpireAddons = async (cid) => {
    try {
      const res = await axios.post(
        'http://localhost:8000/api/check-expired-subscription',
        { company_id: cid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.updated_addons && res.data.updated_addons.length > 0) {
        setAddons(res.data.updated_addons);
        setMessage('⚠️ Addons updated due to expired subscription.');
      }
    } catch (err) {
      console.warn('Check expired subscription error:', err);
    }
  };

  const handleCompanyChange = async (e) => {
    const selectedId = e.target.value;
    setCompanyId(selectedId);
    setSelectedAddons([]);
    await fetchAddons(selectedId);
    await checkAndExpireAddons(selectedId);
  };

  const handleAddonChange = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!startDate || !endDate) {
      setMessage('❌ Start and end dates are required.');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setMessage('❌ End date must be after start date.');
      return;
    }

    try {
      const subscriptionResponse = await axios.post(
        'http://localhost:8000/api/subscribe',
        {
          plan,
          start_date: startDate,
          end_date: endDate,
          company_id: companyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (subscriptionResponse.status === 201 || subscriptionResponse.status === 200) {
        try {
          await axios.post(
            'http://localhost:8000/api/assign-addons',
            {
              addon_ids: selectedAddons,
              company_id: companyId,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setMessage('✅ Subscription and addons saved successfully!');
          resetForm();
        } catch (addonErr) {
          console.error('Addon assignment error:', addonErr);
          setMessage('⚠️ Subscription saved but failed to assign addons.');
        }
      } else {
        setMessage('❌ Failed to save subscription.');
      }
    } catch (err) {
      console.error('Subscription save error:', err);
      const errMsg =
        err.response?.data?.message ||
        '❌ Server error occurred while saving subscription.';
      setMessage(errMsg);
    }
  };

  const resetForm = () => {
    setPlan('');
    setCompanyId('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setSelectedAddons([]);
    setAddons([]);
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h2>Choose Subscription Plan</h2>
        <button className="back-button" onClick={() => navigate('/super-admin-dashboard')}>
          🔙 Back
        </button>
      </div>

      {message && <p className={message.includes('❌') ? 'error' : 'success'}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Select Company</label>
        <select value={companyId} onChange={handleCompanyChange} required>
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} required>
          <option value="">Select Plan</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        {addons.length > 0 && (
          <div className="addon-section">
            <label>Addons</label>
            {addons.map((addon) => (
              <div key={addon.id} className="addon-item">
                <input
                  type="checkbox"
                  id={`addon-${addon.id}`}
                  checked={selectedAddons.includes(addon.id)}
                  onChange={() => handleAddonChange(addon.id)}
                />
                <label htmlFor={`addon-${addon.id}`}>
                  {addon.name} — ${addon.price}
                </label>
              </div>
            ))}
          </div>
        )}

        <button type="submit">Save Subscription</button>
      </form>
    </div>
  );
};

export default SubscriptionPlan;
