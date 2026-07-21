import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
