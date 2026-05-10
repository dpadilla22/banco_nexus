import "./BalanceChart.css";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function BalanceChart({ datos }) {
  if (!datos) return null;

  const chartData = datos.transacciones.map((t) => ({
    fecha: new Date(t.fecha).toLocaleDateString(),

    monto: t.monto,
  }));

  return (
    <div className="chart-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <TrendingUp size={24} color="#5B6FFF" />
        <h2>Evolución del saldo</h2>
      </div>
      <p>Últimos movimientos de tu cuenta</p>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="monto"
              stroke="#5B6FFF"
              strokeWidth={3}
              dot={{ fill: "#5B6FFF", r: 5 }}
              activeDot={{ r: 7 }}
            />

            <CartesianGrid stroke="#E0E7FF" strokeDasharray="5 5" />

            <XAxis dataKey="fecha" stroke="#90A4AE" />

            <YAxis stroke="#90A4AE" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "1px solid #E0E7FF",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(91, 111, 255, 0.15)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
