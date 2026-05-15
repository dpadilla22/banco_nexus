import { useState } from "react";
import { AlertCircle } from "lucide-react";

import Header from "./components/header/Header";
import SearchBar from "./components/SearchBar/SearchBar";
import AccountCard from "./components/AccountCard/AccountCard";
import TransactionsList from "./components/TransactionsList/TransactionsList";
import BalanceChart from "./components/BalanceChart/BalanceChart";
import OperationForm from "./components/OperationForm/OperationForm";

function App() {
  const [cuenta, setCuenta] = useState("");

  const [datos, setDatos] = useState(null);

  const [error, setError] = useState("");

  const consultarCuenta = async () => {
    try {
      setError("");
      setDatos(null);

      const response = await fetch(
        `http://localhost:3000/api/cuenta/${cuenta}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al consultar la cuenta");
        return;
      }

      setDatos(data);
    } catch (error) {
      setError("Error de conexión. Intenta de nuevo.");
      console.log(error);
    }
  };

  const manejarOperacionExitosa = async () => {
    // Reconsultar los datos completos para actualizar transacciones y saldo
    if (cuenta) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cuenta/${cuenta}`,
        );
        const data = await response.json();
        if (response.ok) {
          setDatos(data);
        }
      } catch (error) {
        console.error("Error al reconsultar la cuenta:", error);
      }
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
          <span style={{ fontWeight: "500" }}>{error}</span>
        </div>
      )}

      <AccountCard datos={datos} />

      <OperationForm
        numeroCuenta={datos?.cuenta?.numeroCuenta}
        saldoActual={datos?.cuenta?.saldo || 0}
        onOperationSuccess={manejarOperacionExitosa}
      />

      <TransactionsList datos={datos} />

      <BalanceChart datos={datos} />
    </div>
  );
}

export default App;
