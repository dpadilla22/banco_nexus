const { ejecutarLoteSucursal } = require("./common");

const SUCURSAL = "Loreto";
const operaciones = [
  { tipo: "deposito", monto: 150 },
  { tipo: "retiro", monto: 30 },
  { tipo: "deposito", monto: 90 },
  { tipo: "retiro", monto: 25 },
];

async function ejecutar() {
  return ejecutarLoteSucursal({ sucursal: SUCURSAL, operaciones });
}

if (require.main === module) {
  ejecutar().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { SUCURSAL, operaciones, ejecutar };