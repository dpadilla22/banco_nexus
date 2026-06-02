import "./AccountCard.css";
import { motion } from "framer-motion";
import { User, Wallet, DollarSign, CreditCard } from "lucide-react";

export default function AccountCard({ datos }) {
  if (!datos) return null;

  return (
    <motion.div
      className="account-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2>Información de Cuenta</h2>
      <div className="info-grid">
        <div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <User size={18} />
            Cliente
          </span>
          <h3>{datos.cuenta.titular.nombre}</h3>
        </div>
        <div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CreditCard size={18} />
            Número de cuenta
          </span>
          <h3>{datos.cuenta.numeroCuenta}</h3>
        </div>
        <div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Wallet size={18} />
            Tipo
          </span>
          <h3>{datos.cuenta.tipoCuenta}</h3>
        </div>
        <div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <DollarSign size={18} />
            Saldo
          </span>
          <h1>
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(datos.cuenta.saldo)}
          </h1>
        </div>
      </div>
    </motion.div>
  );
}
