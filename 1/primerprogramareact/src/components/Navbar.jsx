import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';
import logo from '../img/logo.png';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función de cierre de sesión
    navigate('/'); // Redirige a la página de inicio
  };


  return (
    <div className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" onClick={() => navigate('/')} />
      <div className="navbar-buttons">
        <button className="button-nav" onClick={() => navigate('/')}>Inicio</button>
        {!isAuthenticated ? (
          <>
            <button className="button-nav" onClick={() => navigate('/login')}>Iniciar Sesión</button>
            <button className="button-nav" onClick={() => navigate('/register')}>Registro</button>
          </>
        ) : (
          <>
            <button className="button-nav" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="button-nav" onClick={() => navigate('/clientes')}>Clientes</button>
            <button className="button-nav" onClick={() => navigate('/productos')}>Productos</button>
            <button className="button-nav" onClick={() => navigate('/proveedor')}>Proveedor</button>
            <button className="button-nav" onClick={() => navigate('/compras')}>Compras</button>
            <button className="button-nav" onClick={() => navigate('/ventas')}>Ventas</button>
            <button className="button-nav" onClick={handleLogout}>Cerrar Sesión</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;