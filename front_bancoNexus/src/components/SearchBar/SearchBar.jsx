import "./SearchBar.css";

import { Search } from "lucide-react";

export default function SearchBar({ cuenta, setCuenta, consultarCuenta }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Número de cuenta"
        value={cuenta}
        onChange={(e) => setCuenta(e.target.value)}
      />

      <button onClick={consultarCuenta}>
        <Search size={18} />
        Consultar
      </button>
    </div>
  );
}
