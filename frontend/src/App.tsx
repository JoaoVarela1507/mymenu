import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ProtectedRoute } from './components/shared';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OrdersCenter from './pages/admin/OrdersCenter';
import Menu from './pages/admin/Menu';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Profile from './pages/admin/Profile';
import Home from './pages/consumer/Home';
import RestaurantPage from './pages/consumer/RestaurantPage';
import Nearby from './pages/consumer/Nearby';
import Favorites from './pages/consumer/Favorites';
import Login from './pages/Login';
import SignupChoice from './pages/SignupChoice';
import SignupConsumer from './pages/SignupConsumer';
import SignupRestaurant from './pages/SignupRestaurant';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            {/* Login e Cadastro */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<SignupChoice />} />
            <Route path="/cadastro/consumidor" element={<SignupConsumer />} />
            <Route path="/cadastro/restaurante" element={<SignupRestaurant />} />

            {/* Rotas com Sidebar (Admin e Consumidor) */}
            <Route path="/" element={
              <ProtectedRoute allowedTypes={['consumer', 'admin', 'staff']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Home Consumidor */}
              <Route index element={<Home />} />
              <Route path="restaurante/:slug" element={<RestaurantPage />} />
              <Route path="proximos" element={<Nearby />} />
              <Route path="favoritos" element={<Favorites />} />

              {/* Admin */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/orders" element={
                <ProtectedRoute allowedTypes={['admin', 'staff']}>
                  <OrdersCenter />
                </ProtectedRoute>
              } />
              <Route path="admin/menu" element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Menu />
                </ProtectedRoute>
              } />
              <Route path="admin/reports" element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="admin/settings" element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="admin/settings/:tab" element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="admin/profile" element={
                <ProtectedRoute allowedTypes={['admin', 'staff']}>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
