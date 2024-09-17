import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';
import logo from '../img/logo.png';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="container-footer">

      <div className="grid-container">

        <div className="logof">
          <img src={logo} alt="Logo" className="logo-f" onClick={() => navigate('/')} />
        </div>

        <div className="grid">
          <h2>Informacion de Contacto</h2>
          <ul>
            <li><strong>Dirección: </strong>Crr42 #36-30</li>
            <li><strong>Correo electrónico:</strong> formayfigura@gmail.com</li>
            <li><strong>Teléfono:</strong> 30098752791</li>
            <li><strong>Horarios de atención:</strong> 4am - 1am</li>
          </ul>
        </div>

        <div className="grid">
          <h2>Redes Sociales</h2>
          <div className="iconos">
            <button><InstagramIcon /></button>
            <button><FacebookIcon /></button>
            <button><WhatsAppIcon /></button>
            <button><XIcon /></button>
          </div>
        </div>

      </div>

      <div className="footer">
        <p>© 2024 Forma y Figura. Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default Footer;