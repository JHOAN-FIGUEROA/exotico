import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import gym1 from '../img/gym.jpg'; 
import gym2 from '../img/gym1.jpg';
import gym3 from '../img/gym2.jpg';
import gym4 from '../img/gym 3.jpg';

const images = [gym1, gym2, gym3, gym4];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 

    return () => clearInterval(timer);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="content">
      <h1>Bienvenido al Gimnasio</h1>
      <p>Descubre nuestros servicios y regístrate para más información.</p>
      
      <div className="gallery">
        <button className="gallery-button" onClick={handlePrevious}>Anterior</button>
        <img src={images[currentIndex]} alt="Galería" className="gallery-image" />
        <button className="gallery-button" onClick={handleNext}>Siguiente</button>
      </div>
    </div>
  );
};

export default HomePage;
