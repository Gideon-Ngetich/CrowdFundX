import React from "react"
import { Routes, Route } from 'react-router-dom'
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CrowdCampaignDetails from "./pages/CrowdCampaignDetails"

function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/:id" element={<CrowdCampaignDetails />} />
    </Routes>

  )
}

export default App
