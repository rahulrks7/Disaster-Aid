import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { VolunteerLayout } from '../layouts/VolunteerLayout';
import { CitizenLayout } from '../layouts/CitizenLayout';

// Public Pages
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { MapExplorer } from '../pages/MapExplorer';
import { PublicAlerts } from '../pages/PublicAlerts';
import { PublicShelters } from '../pages/PublicShelters';
import { EmergencyContacts } from '../pages/EmergencyContacts';
import { NotFound } from '../pages/NotFound';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ReportDisasterPage } from '../pages/citizen/ReportDisasterPage';
import { RequestHelpPage } from '../pages/citizen/RequestHelpPage';
import { MyReportsPage } from '../pages/citizen/MyReportsPage';
import { MyRequestsPage } from '../pages/citizen/MyRequestsPage';
import { CitizenProfilePage } from '../pages/citizen/CitizenProfilePage';

// Volunteer Pages
import { VolunteerDashboard } from '../pages/volunteer/VolunteerDashboard';
import { AvailableTasksPage } from '../pages/volunteer/AvailableTasksPage';
import { MyTasksPage } from '../pages/volunteer/MyTasksPage';
import { VolunteerProfilePage } from '../pages/volunteer/VolunteerProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManageDisastersPage } from '../pages/admin/ManageDisastersPage';
import { ManageHelpRequestsPage } from '../pages/admin/ManageHelpRequestsPage';
import { ManageTasksPage } from '../pages/admin/ManageTasksPage';
import { ManageVolunteersPage } from '../pages/admin/ManageVolunteersPage';
import { ManageResourcesPage } from '../pages/admin/ManageResourcesPage';
import { ManageSheltersPage } from '../pages/admin/ManageSheltersPage';
import { ManageAlertsPage } from '../pages/admin/ManageAlertsPage';
import { ManageUsersPage } from '../pages/admin/ManageUsersPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Protected Route Wrapper Component
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to respective role dashboard
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'volunteer') return <Navigate to="/volunteer/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapExplorer />} />
        <Route path="/alerts" element={<PublicAlerts />} />
        <Route path="/shelters" element={<PublicShelters />} />
        <Route path="/contacts" element={<EmergencyContacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Citizen Portal Routes */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'admin']}>
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="report" element={<ReportDisasterPage />} />
        <Route path="request-help" element={<RequestHelpPage />} />
        <Route path="my-reports" element={<MyReportsPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="profile" element={<CitizenProfilePage />} />
      </Route>

      {/* Volunteer Portal Routes */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <VolunteerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="available-tasks" element={<AvailableTasksPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />
        <Route path="profile" element={<VolunteerProfilePage />} />
      </Route>

      {/* Administrator Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="disasters" element={<ManageDisastersPage />} />
        <Route path="help-requests" element={<ManageHelpRequestsPage />} />
        <Route path="tasks" element={<ManageTasksPage />} />
        <Route path="volunteers" element={<ManageVolunteersPage />} />
        <Route path="resources" element={<ManageResourcesPage />} />
        <Route path="shelters" element={<ManageSheltersPage />} />
        <Route path="alerts" element={<ManageAlertsPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
};
