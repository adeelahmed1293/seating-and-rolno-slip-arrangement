import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import SetupPage from './pages/SetupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function NavigationHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    if (window.esms?.onNavigate) {
      window.esms.onNavigate((route) => navigate(route))
    }
  }, [navigate])
  return null
}

export default function App() {
  return (
    <>
      <NavigationHandler />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  )
}
