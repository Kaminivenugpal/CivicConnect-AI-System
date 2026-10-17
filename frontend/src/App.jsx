import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityComplaintDetailPage from './pages/AuthorityComplaintDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />

        {/* Protected Citizen Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <SubmitComplaintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <MyComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Authority Routes */}
        <Route
          path="/authority"
          element={
            <ProtectedRoute requiredRole="AUTHORITY">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authority/complaints/:id"
          element={
            <ProtectedRoute requiredRole="AUTHORITY">
              <AuthorityComplaintDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
