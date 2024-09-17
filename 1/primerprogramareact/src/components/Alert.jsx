import React from 'react';
import '../styles/Alert.css';

const Alert = ({ message }) => {
  return (
    <div className="alert">
      <p>{message}</p>
    </div>
  );
};

export default Alert;