import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // 👈 Added homepage
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/Notfound';
import PrivateRoute from './pages/PrivateRoute'; // Add this import
// Superadmin
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard.jsx';
import CompanyManagement from './pages/superadmin/CompanyManagement.jsx';
import CompanyList from './pages/superadmin/CompanyList.jsx';
import UserManagement from './pages/superadmin/Usermanagement.jsx';
import UserList from './pages/superadmin/userlist.jsx';

// HR
import AddEmployee from './pages/hr/AddEmployee.jsx';
import EmployeeManagement from './pages/hr/EmployeeManagement.jsx';
import AddDepartment from './pages/hr/AddDepartment.jsx';
import ManagementDepartment from './pages/hr/ManagementDepartment.jsx';
import AddAttendence from './pages/hr/AddAttendence.jsx';
import ManageAttendence from './pages/hr/ManageAttendence.jsx';
import EmployeeDashboard from './pages/hr/EmployeeDashbaord.jsx';

// Owner
import AddProperty from './pages/owner/Addproperty.jsx';
import ManageProperty from './pages/owner/Manageproperty.jsx';
import AddFlat from './pages/owner/Addflat.jsx';
import ManageFlat from './pages/owner/Manageflat.jsx';
import AddCustomer from './pages/owner/AddCustomer.jsx';
import ManageCustomer from './pages/owner/ManageCustomer.jsx';
import AddBudget from './pages/owner/AddBudget.jsx';
import ManageBudget from './pages/owner/Managebudget.jsx';
import AddHR from './pages/owner/AddHR.jsx';
import HRManage from './pages/owner/HRmanage.jsx';
import AddNotice from './pages/owner/Addnotice.jsx';
import NoticeList from './pages/owner/ManageNotice.jsx';
import CompanyadminDashboard from './pages/owner/CompanyadminDashboard.jsx';
import CheckComplain from './pages/owner/CheckComplain.jsx';
import AddOwner from './pages/owner/AddOwner.jsx';
import ManageOwner from './pages/owner/ManageOwner.jsx';
import AddBill from './pages/owner/AddBill.jsx';
import ManageBill from './pages/owner/ManageBill.jsx';

// Tenant
import AddComplaint from './pages/tenant/AddComplaints.jsx';
import { ManageComplain } from './pages/tenant/ManageComplain.jsx';
import LeaseInfo from './pages/tenant/LeaseInfo.jsx';
import BillInfo from './pages/tenant/BillInfo.jsx';
import AddPayment from './pages/tenant/AddPayment.jsx';
import ManagePayment from './pages/tenant/ManagePayment.jsx';
import TenantDashboard from './pages/tenant/tenantDashboard.jsx';

// Admin / Shared
import AddLease from './pages/admin/AddLease.jsx';
import { Income } from './pages/admin/Income.jsx';
import OwnerDashboard from './pages/admin/OwnerDashboard.jsx';
import ManageLease from './pages/admin/ManageLease.jsx';
import ChatApp from './components/ChatGroup.jsx';
import DashboardSettings from './components/DashboardSettings.jsx';
import SubscriptionPlan from './pages/superadmin/Subscriptionplan.jsx';
import AddonManagement from './pages/superadmin/AddonManagement.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home & Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Superadmin Routes */}
        <Route path="/super-admin-dashboard" element={<SuperadminDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/userlist" element={<UserList />} />
        <Route path="/company-list" element={<CompanyList />} />
        <Route path="/company-management" element={<CompanyManagement />} />

        {/* HR Routes */}
        <Route path="/Addemployee" element={<AddEmployee />} />
        <Route path="/EmployeeManagement" element={<EmployeeManagement />} />
        <Route path="/AddDepartment" element={<AddDepartment />} />
        <Route path="/ManageDepartment" element={<ManagementDepartment />} />
        <Route path="/AddAttendence" element={<AddAttendence />} />
        <Route path="/ManageAttendence" element={<ManageAttendence />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />

        {/* Owner Routes */}
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/manage-property" element={<ManageProperty />} />
        <Route path="/add-flat" element={<AddFlat />} />
        <Route path="/manage-flat" element={<ManageFlat />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/manage-customer" element={<ManageCustomer />} />
        <Route path="/add-budget" element={<AddBudget />} />
        <Route path="/manage-budget" element={<ManageBudget />} />
        <Route path="/add-hr" element={<AddHR />} />
        <Route path="/manage-hr" element={<HRManage />} />
        <Route path="/add-notice" element={<AddNotice />} />
        <Route path="/notice-list" element={<NoticeList />} />
        <Route path="/company-admin" element={<CompanyadminDashboard />} />
        <Route path="/check-complain" element={<CheckComplain />} />
        <Route path="/add-owner" element={<AddOwner />} />
        <Route path="/manage-owner" element={<ManageOwner />} />
        <Route path="/add-bill" element={<AddBill />} />
        <Route path="/manage-bill" element={<ManageBill />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/manage-lease" element={<ManageLease />} />

        {/* Tenant Routes */}
        <Route path="/add-complain" element={<AddComplaint />} />
        <Route path="/manage-complain" element={<ManageComplain />} />
        <Route path="/lease-info" element={<LeaseInfo />} />
        <Route path="/bill-info" element={<BillInfo />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/manage-payment" element={<ManagePayment />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />

        {/* Admin Shared Features */}
        <Route path="/add-lease" element={<AddLease />} />
        <Route path="/incomeinfo" element={<Income />} />
        <Route path="/chat-group" element={<ChatApp />} />
        <Route path = "/subscription-control" element = {<SubscriptionPlan></SubscriptionPlan>}></Route>
        {/* Fallback */}
        <Route path = "/dashboard-settings" element= {<DashboardSettings></DashboardSettings>}></Route>
        <Route path = "/addon-management" element = {<AddonManagement></AddonManagement>}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
