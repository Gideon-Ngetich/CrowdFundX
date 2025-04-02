import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CrowdCampaignDetails from "./pages/CrowdCampaignDetails";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import Navbar from "./components/Navbar";
import GroupRegistrationForm from "./pages/GroupRegistrationForm";
import MpesaAccountForm from "./pages/MpesaAccountsForm";
import CampaignDetails from "./pages/CrowdFundingDetails";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import AdminChamaDashboard from "./pages/ChamaDashboard"
import ChamaDetails from "./pages/ChamaAdminDetails";
import CrowdFundingRegistration from './pages/CrowdFundRegForm'
import GroupFundingDashboard from './pages/GroupFundingDetails'
import ChamaRegistratonForm from './pages/ChamaRegistratoion'
import AboutPage from "./pages/About";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaign/:id" element={<CampaignDetails />} />
      <Route path="/dashboard/:id" element={<CrowdCampaignDetails />} />
      <Route path="/dashboard/accountselection/groupfundingregistration" element={<GroupRegistrationForm />} />
      <Route path="/accountregistration" element={<MpesaAccountForm />} />
      <Route path="/dashboard/accountselection" element={<AccountTypeSelection />} />
      <Route path="/dashboard/accountselection/crowdfundingregistration" element={<CrowdFundingRegistration />} />
      <Route path="/dashboard/chama/:id" element={<ChamaDetails />} />
      <Route path="/dashboard/groups/:id" element={<GroupFundingDashboard />} />
      <Route path="/dashboard/accountselection/chamaregistration" element={<ChamaRegistratonForm />} />
      <Route path="/about-us" element={<AboutPage />} />


    </Routes>

  );
}

export default App;
