import React from 'react';
import './Header.css';

export default function Header({ usuario }) {
  return (
    <header className="header">
      <h1>Bienvenido {usuario?.nombre || "Usuario"}</h1>
      <p>Gestiona tu cuenta y transacciones de forma segura</p>
    </header>
  );
}
