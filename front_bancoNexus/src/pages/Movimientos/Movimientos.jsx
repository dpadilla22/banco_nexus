import TransactionsList from "../../components/TransactionsList/TransactionsList";
import "./Movimientos.css";

export default function Movimientos({ datos }) {
  return (
    <div className="movimientos-page">
      <TransactionsList datos={datos} modo="historial" />
    </div>
  );
}
