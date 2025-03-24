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
      <Route path="/group-registration" element={<GroupRegistrationForm />} />
      <Route path="/mpesaacountregistration" element={<MpesaAccountForm />} />

    </Routes>

  );
}

export default App;
