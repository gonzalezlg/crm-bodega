import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import CategoriasPage from '../pages/CategoriasPage';
import ClientesPage from '../pages/ClientesPage';
import DashboardPage from '../pages/DashboardPage';
import ExperienceTimeSlotsPage from '../pages/ExperienceTimeSlotsPage';
import ExperiencesPage from '../pages/ExperiencesPage';
import LoginPage from '../pages/LoginPage';
import ProductoDetallePage from '../pages/ProductoDetallePage';
import ProductoEditarPage from '../pages/ProductoEditarPage';
import ProductoNuevoPage from '../pages/ProductoNuevoPage';
import ProductosPage from '../pages/ProductosPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route
            path="/experiences/:experienceId/time-slots"
            element={<ExperienceTimeSlotsPage />}
          />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/productos/nuevo" element={<ProductoNuevoPage />} />
          <Route path="/productos/:id/editar" element={<ProductoEditarPage />} />
          <Route path="/productos/:id" element={<ProductoDetallePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
