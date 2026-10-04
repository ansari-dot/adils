import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CustomRequestsPage } from './pages/CustomRequestsPage';
import { CustomRequestDetailPage } from './pages/CustomRequestDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { MediaPage } from './pages/MediaPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Admin Login */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />

            {/* Protected Admin Suite */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Users */}
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:id" element={<UserDetailPage />} />

              {/* Products */}
              <Route path="products" element={<ProductsPage />} />

              {/* Orders */}
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />

              {/* Custom Cake Requests */}
              <Route path="custom-requests" element={<CustomRequestsPage />} />
              <Route path="custom-requests/:id" element={<CustomRequestDetailPage />} />

              {/* Courses */}
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/:id" element={<CourseDetailPage />} />

              {/* Enrollments */}
              <Route path="enrollments" element={<EnrollmentsPage />} />

              {/* Tools */}
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="media" element={<MediaPage />} />

              {/* System */}
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
