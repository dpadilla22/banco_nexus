import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import Header from "./components/header/Header";
import SearchBar from "./components/SearchBar/SearchBar";
import AccountCard from "./components/AccountCard/AccountCard";
import TransactionsList from "./components/TransactionsList/TransactionsList";
import BalanceChart from "./components/BalanceChart/BalanceChart";
import OperationForm from "./components/OperationForm/OperationForm";
import StatusBanner from "./components/StatusBanner/StatusBanner";

function App() {
  const [cuenta, setCuenta] = useState("");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [estadoSistema, setEstadoSistema] = useState("online");
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  useEffect(() => {
    const verificarServidor = async () => {
      try {
        await fetchConTimeout(
          "http://localhost:3000/health",

          {},

          3000,
        );

        /* TODO BIEN */

        setEstadoSistema("online");

        setIntentosFallidos(0);
      } catch (error) {
        /* SUMAR FALLO */

        setIntentosFallidos((prev) => {
          const nuevosIntentos = prev + 1;

          /* PRIMEROS FALLOS */

          if (nuevosIntentos < 3) {
            setEstadoSistema("loading");
          } else {
            /* MUCHOS FALLOS */

            setEstadoSistema("offline");
          }

          return nuevosIntentos;
        });
      }
    };

    verificarServidor();

    const interval = setInterval(verificarServidor, 3000);

    /* LIMPIAR */

    return () => clearInterval(interval);
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

  const consultarCuenta = async () => {
    try {
      setError("");
      setDatos(null);
      setEstadoSistema("loading");

      const response = await fetchConTimeout(
        `http://localhost:3000/api/cuenta/${cuenta}`,
      );

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error al parsear JSON:", parseError);
        setError("Error en la respuesta del servidor");
        setEstadoSistema("offline");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Error al consultar la cuenta");
        setEstadoSistema("online");
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
    }
  };

  const manejarOperacionExitosa = async () => {
    if (!cuenta) return;
    try {
      const response = await fetchConTimeout(
        `http://localhost:3000/api/cuenta/${cuenta}`,
      );

      const data = await response.json();

      if (response.ok) {
        setDatos(data);
        setEstadoSistema("online");
      }
    } catch (error) {
      console.error("Error al actualizar cuenta:", error);
      setEstadoSistema("offline");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px",
      }}
    >
      <Header />

      <StatusBanner estado={estadoSistema} />

      <SearchBar
        cuenta={cuenta}
        setCuenta={setCuenta}
        consultarCuenta={consultarCuenta}
      />

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
          <span
            style={{
              fontWeight: "500",
            }}
          >
            {error}
          </span>
        </div>
      )}
      <AccountCard datos={datos} />
      <OperationForm
        numeroCuenta={datos?.cuenta?.numeroCuenta}
        saldoActual={datos?.cuenta?.saldo || 0}
        onOperationSuccess={manejarOperacionExitosa}
        setEstadoSistema={setEstadoSistema}
        fetchConTimeout={fetchConTimeout}
      />
      <TransactionsList datos={datos} />
      <BalanceChart datos={datos} />
    </div>
  );
}

export default App;
