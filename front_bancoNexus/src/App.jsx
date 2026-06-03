import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import Header from "./components/header/Header";
import AccountCard from "./components/AccountCard/AccountCard";
import TransactionsList from "./components/TransactionsList/TransactionsList";
import BalanceChart from "./components/BalanceChart/BalanceChart";
import OperationForm from "./components/OperationForm/OperationForm";
import StatusBanner from "./components/StatusBanner/StatusBanner";
import Auth from "./pages/Auth/Auth";
import Sidebar from "./components/Sidebar/Sidebar";
import Profile from "./pages/Profile/Profile";
import Transferencias from "./pages/Transferencias/Transferencias";
import Movimientos from "./pages/Movimientos/Movimientos";

function App() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [estadoSistema, setEstadoSistema] = useState("online");
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [pantalla, setPantalla] = useState("dashboard");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const fetchConTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const verificarServidor = async () => {
      try {
        await fetchConTimeout("http://localhost:3000/health", {}, 3000);

        setEstadoSistema("online");
        setIntentosFallidos(0);
      } catch (error) {
        setIntentosFallidos((prev) => {
          const nuevosIntentos = prev + 1;

          if (nuevosIntentos < 3) {
            setEstadoSistema("loading");
          } else {
            setEstadoSistema("offline");
          }

          return nuevosIntentos;
        });
      }
    };

    verificarServidor();
    const interval = setInterval(verificarServidor, 3000);

    return () => clearInterval(interval);
  }, []);

  const consultarCuenta = async (numeroCuenta) => {
    if (!numeroCuenta) return;

    try {
      setError("");
      setCargandoDatos(true);
      setEstadoSistema("loading");

      const response = await fetchConTimeout(
        `http://localhost:3000/api/cuenta/${numeroCuenta}`,
        {
          headers: authHeaders(),
        },
        5000,
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          cerrarSesion();
          setError("Tu sesión expiró. Inicia sesión nuevamente.");
          return;
        }
        setError(data?.error || "Error al consultar la cuenta");
        setEstadoSistema("offline");
        return;
      }
      setDatos(data);
      setEstadoSistema("online");
    } catch (error) {
      console.log(error);

      if (error.name === "AbortError") {
        setError("Conexión lenta. El servidor no respondió a tiempo.");
        setEstadoSistema("loading");
      } else {
        setError("Error de conexión. El servidor no está disponible.");
        setEstadoSistema("offline");
      }
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    if (usuario?.numeroCuenta) {
      consultarCuenta(usuario.numeroCuenta);
    }
  }, [usuario]);

  const manejarOperacionExitosa = async () => {
    if (usuario?.numeroCuenta) {
      await consultarCuenta(usuario.numeroCuenta);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setDatos(null);
    setError("");
    setEstadoSistema("online");
    setIntentosFallidos(0);
    setPantalla("dashboard");
  };

  if (!usuario) {
    return <Auth setUsuario={setUsuario} />;
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px",
      }}
    >
      {pantalla !== "perfil" &&
        pantalla !== "transferencias" &&
        pantalla !== "movimientos" && <Header usuario={usuario} />}

      <Sidebar
        pantalla={pantalla}
        setPantalla={setPantalla}
        cerrarSesion={cerrarSesion}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "12px",
        }}
      ></div>

      <StatusBanner estado={estadoSistema} />

      {error && (
        <div
          style={{
            backgroundColor: "#FFEBEE",
            border: "1px solid #FFCDD2",
            color: "#C62828",
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 8px rgba(198, 40, 40, 0.1)",
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontWeight: "500" }}>{error}</span>
        </div>
      )}

      {cargandoDatos && !datos && (
        <div
          style={{
            padding: "18px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: "24px",
            color: "#1a237e",
            fontWeight: 600,
          }}
        >
          Cargando información de la cuenta...
        </div>
      )}

      {pantalla === "dashboard" && (
        <>
          <AccountCard datos={datos} />

          <OperationForm
            numeroCuenta={usuario?.numeroCuenta}
            saldoActual={datos?.cuenta?.saldo || 0}
            onOperationSuccess={manejarOperacionExitosa}
            setEstadoSistema={setEstadoSistema}
            fetchConTimeout={fetchConTimeout}
            authHeaders={authHeaders}
          />

          <TransactionsList datos={datos} modo="dashboard" />

          <BalanceChart datos={datos} />
        </>
      )}

      {pantalla === "perfil" && (
        <Profile
          authHeaders={authHeaders}
          usuario={usuario}
          setUsuario={setUsuario}
        />
      )}

      {pantalla === "movimientos" && <Movimientos datos={datos} />}

      {pantalla === "transferencias" && (
        <Transferencias
          authHeaders={authHeaders}
          onTransferSuccess={manejarOperacionExitosa}
          saldoActual={datos?.cuenta?.saldo || 0}
        />
      )}

      {pantalla === "bitacora" && <h2>Bitácora (pendiente)</h2>}
    </div>
  );
}

export default App;
