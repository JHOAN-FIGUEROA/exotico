import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import Proveedor from './components/Proveedor';
import Compras from './components/Compras';
import Ventas from './components/Ventas';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Importa el componente ProtectedRoute
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route
              path="/clientes"
              element={<ProtectedRoute element={<Clientes />} />}
            />
            <Route
              path="/productos"
              element={<ProtectedRoute element={<Productos />} />}
            />
            <Route
              path="/proveedor"
              element={<ProtectedRoute element={<Proveedor />} />}
            />
            <Route
              path="/compras"
              element={<ProtectedRoute element={<Compras />} />}
            />
            <Route
              path="/ventas"
              element={<ProtectedRoute element={<Ventas />} />}
            />
          </Routes>
        </div>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;