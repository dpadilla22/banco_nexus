import "./SearchBar.css";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
}) {
  return (
    <div className="search-container">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
