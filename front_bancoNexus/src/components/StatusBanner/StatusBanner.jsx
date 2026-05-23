import "./StatusBanner.css";
import { CheckCircle2, Loader2, WifiOff } from "lucide-react";

export default function StatusBanner({ estado }) {
  const estados = {
    online: {
      texto: "En línea",
      icono: <CheckCircle2 size={16} />,
    },
    loading: {
      texto: "Conectando",
      icono: <Loader2 size={16} className="spin" />,
    },
    offline: {
      texto: "Sin conexión",
      icono: <WifiOff size={16} />,
    },
  };
  const actual = estados[estado];
  if (!actual) return null;
  return (
    <div className={`status-banner ${estado}`}>
      {actual.icono}
      <span>{actual.texto}</span>
    </div>
  );
}
