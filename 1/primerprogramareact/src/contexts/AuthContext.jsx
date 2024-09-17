import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar el usuario desde localStorage cuando el componente se monte
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://api-qe5e.onrender.com/Usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, contraseña: password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.token); // Almacena el token o la información del usuario
        localStorage.setItem('user', data.token); // Guardar el token en localStorage
        alert('Inicio de sesión exitoso'); // Muestra una alerta de éxito
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
        navigate(redirectTo);
      } else {
        throw new Error(data.error || 'Error al iniciar sesión.');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Elimina el token del localStorage
    navigate('/login');
  };

  const isAuthenticated = !!user; // Determina si el usuario está autenticado

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
