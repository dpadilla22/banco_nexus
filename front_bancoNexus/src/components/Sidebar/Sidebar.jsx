import {
  Menu,
  X,
  Home,
  ArrowLeftRight,
  History,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar({ pantalla, setPantalla, cerrarSesion }) {
  const [abierto, setAbierto] = useState(false);

  const opciones = [
    {
      id: "dashboard",
      texto: "Dashboard",
      icono: <Home size={18} />,
    },
    {
      id: "transferencias",
      texto: "Transferencias",
      icono: <ArrowLeftRight size={18} />,
    },
    {
      id: "movimientos",
      texto: "Movimientos",
      icono: <History size={18} />,
    },
    {
      id: "perfil",
      texto: "Perfil",
      icono: <User size={18} />,
    },
  ];

  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [abierto]);

  return (
    <>
      <button className="menu-btn" onClick={() => setAbierto(true)}>
        <Menu size={20} />
      </button>

      <div
        className={`sidebar-overlay ${abierto ? "active" : ""}`}
        onClick={() => setAbierto(false)}
      />

      <aside className={`sidebar ${abierto ? "active" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h2>Banco Nexus</h2>

            <button onClick={() => setAbierto(false)}>
              <X size={20} />
            </button>
          </div>

          {opciones.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${pantalla === item.id ? "active" : ""}`}
              onClick={() => {
                setPantalla(item.id);
                setAbierto(false);
              }}
            >
              {item.icono}
              {item.texto}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              cerrarSesion();
              setAbierto(false);
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
