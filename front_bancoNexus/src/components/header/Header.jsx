import { CreditCard } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <h1>
        <CreditCard size={32} />
        Banco Nexus
      </h1>
      <p>Gestiona tus cuentas y transacciones de forma segura</p>
    </header>
  );
}