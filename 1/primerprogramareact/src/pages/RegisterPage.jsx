import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    contraseña: '',
    confirmarContraseña: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    contraseña: '',
    confirmarContraseña: '',
    global: '',
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (formData.nombre.length < 3 || formData.nombre.length > 12) {
      newErrors.nombre = 'Nombre debe tener entre 3 y 12 caracteres.';
    }

    if (formData.apellido.length < 3 || formData.apellido.length > 12) {
      newErrors.apellido = 'Apellido debe tener entre 3 y 12 caracteres.';
    }

    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico no válido.';
    }

    if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Número de teléfono debe tener 10 dígitos.';
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{10,15}$/;
    if (!passwordPattern.test(formData.contraseña)) {
      newErrors.contraseña = 'La contraseña debe tener entre 10 y 15 caracteres, incluir una mayúscula y un número.';
    }

    if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch('https://api-qe5e.onrender.com/Usuarios/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          setIsRegistered(true);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setErrors({ ...errors, global: data.error || 'Error al registrar. Inténtalo de nuevo.' });
        }
      } catch (err) {
        setErrors({ ...errors, global: 'Error en el servidor. Inténtalo de nuevo.' });
      }
    }
  };

  return (
    <div>
      {!isRegistered ? (
        <form onSubmit={handleSubmit} className="form">
          <h2>Registro</h2>
          {errors.global && <span className="error">{errors.global}</span>}
          <div>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="error">{errors.nombre}</span>}
          </div>
          <div>
            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
            />
            {errors.apellido && <span className="error">{errors.apellido}</span>}
          </div>
          <div>
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
            />
            {errors.correo && <span className="error">{errors.correo}</span>}
          </div>
          <div>
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <span className="error">{errors.telefono}</span>}
          </div>
          <div>
            <label>Contraseña</label>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
            />
            {errors.contraseña && <span className="error">{errors.contraseña}</span>}
          </div>
          <div>
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmarContraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
            />
            {errors.confirmarContraseña && <span className="error">{errors.confirmarContraseña}</span>}
          </div>
          <button type="submit">Registrarse</button>
        </form>
      ) : (
        <div>
          <h2>¡Registro exitoso!</h2>
          <button onClick={() => navigate('/login')}>Ir a Iniciar Sesión</button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;


