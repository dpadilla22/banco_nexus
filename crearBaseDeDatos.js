const { MongoClient } = require("mongodb");

// const url = "mongodb://localhost:27017";

// const replicaUrl =
//   "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rsBanco";

require("dotenv").config();

const {generarNumeroCuenta} = require("./utils/numeroCuenta");

const client = new MongoClient(process.env.MONGO_URI);

async function crearBaseDatos() {
  try {
    await client.connect();

    console.log("Conectado a MongoDB");

    const db = client.db("nexus_banca");

    const clientes = db.collection("clientes");
    await clientes.createIndex({ correo:1},{ unique:true});
    const cuentas = db.collection("cuentas");
    await cuentas.createIndex({ numeroCuenta:1},{ unique:true});
    const transacciones = db.collection("transacciones");
    const bitacora = db.collection("bitacora");
    const beneficiarios =db.collection("beneficiarios");

    await clientes.deleteMany({});
    await cuentas.deleteMany({});
    await transacciones.deleteMany({});
    await bitacora.deleteMany({});
    await beneficiarios.deleteMany({});

    const resultadoClientes = await clientes.insertMany([
      {
        nombre: "Danna Padilla",
        curp: "DANJ010101HBSRRN01",
        telefono: "6121234567",
        correo: "dann@gmail.com",
      },
      {
        nombre: "Javier Rojo",
        curp: "JAVM020202MBSRRN02",
        telefono: "6129876543",
        correo: "javi@gmail.com",
      },
      {
        nombre: "Michelle Obeso",
        curp: "MICM020202MBSRRN02",
        telefono: "6129876543",
        correo: "michi@gmail.com",
      },
      {
        nombre: "Alexandra de la O",
        curp: "ALEM020202MBSRRN02",
        telefono: "6129876543",
        correo: "ale@gmail.com",
      },
      {
        nombre: "Alejandro Hernández",
        curp: "HEMC030303HBSRRN03",
        telefono: "6121112233",
        correo: "carlos@gmail.com",
      },
      {
        nombre: "Andrea López",
        curp: "LOPA040404MBSRRN04",
        telefono: "6122223344",
        correo: "andrea@gmail.com",
      },
      {
        nombre: "Fernanda Ruiz",
        curp: "RUF050505MBSRRN05",
        telefono: "6123334455",
        correo: "fernanda@gmail.com",
      },
      {
        nombre: "Luis Martínez",
        curp: "MALL060606HBSRRN06",
        telefono: "6124445566",
        correo: "luis@gmail.com",
      },
      {
        nombre: "Sofía Castro",
        curp: "CASS070707MBSRRN07",
        telefono: "6125556677",
        correo: "sofia@gmail.com",
      },
      {
        nombre: "Miguel Torres",
        curp: "TOMM080808HBSRRN08",
        telefono: "6126667788",
        correo: "miguel@gmail.com",
      },
      {
        nombre: "Valeria Sánchez",
        curp: "SAV090909MBSRRN09",
        telefono: "6127778899",
        correo: "valeria@gmail.com",
      },
      {
        nombre: "Diego Navarro",
        curp: "NADD101010HBSRRN10",
        telefono: "6128889900",
        correo: "diego@gmail.com",
      },
    ]);

    const idsClientes = Object.values(resultadoClientes.insertedIds);

const resultadoCuentas = await cuentas.insertMany([
  {
    numeroCuenta: generarNumeroCuenta(1),
    saldo: 5000,
    tipoCuenta: "Débito",
    clienteId: idsClientes[0],
  },
  {
    numeroCuenta: generarNumeroCuenta(2),
    saldo: 10000,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[1],
  },
  {
    numeroCuenta: generarNumeroCuenta(3),
    saldo: 500,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[2],
  },
  {
    numeroCuenta: generarNumeroCuenta(4),
    saldo: 15000,
    tipoCuenta: "Débito",
    clienteId: idsClientes[3],
  },
  {
    numeroCuenta: generarNumeroCuenta(5),
    saldo: 3200,
    tipoCuenta: "Débito",
    clienteId: idsClientes[4],
  },
  {
    numeroCuenta: generarNumeroCuenta(6),
    saldo: 8700,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[5],
  },
  {
    numeroCuenta: generarNumeroCuenta(7),
    saldo: 4300,
    tipoCuenta: "Débito",
    clienteId: idsClientes[6],
  },
  {
    numeroCuenta: generarNumeroCuenta(8),
    saldo: 12500,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[7],
  },
  {
    numeroCuenta: generarNumeroCuenta(9),
    saldo: 9600,
    tipoCuenta: "Débito",
    clienteId: idsClientes[8],
  },
  {
    numeroCuenta: generarNumeroCuenta(10),
    saldo: 7100,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[9],
  },
  {
    numeroCuenta: generarNumeroCuenta(11),
    saldo: 13400,
    tipoCuenta: "Débito",
    clienteId: idsClientes[10],
  },
  {
    numeroCuenta: generarNumeroCuenta(12),
    saldo: 2500,
    tipoCuenta: "Ahorro",
    clienteId: idsClientes[11],
  },
]);

    const idsCuentas = Object.values(resultadoCuentas.insertedIds);

    await transacciones.insertMany([
      {
        cuentaId: idsCuentas[0],
        tipo: "Depósito",
        monto: 2000,
        sucursal: "La Paz",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[1],
        tipo: "Retiro",
        monto: 500,
        sucursal: "Los Cabos",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[2],
        tipo: "Transferencia",
        monto: 1200,
        sucursal: "Loreto",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[3],
        tipo: "Depósito",
        monto: 3500,
        sucursal: "La Paz",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[4],
        tipo: "Pago",
        monto: 900,
        sucursal: "Los Cabos",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[5],
        tipo: "Retiro",
        monto: 2500,
        sucursal: "Mulegé",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[6],
        tipo: "Depósito",
        monto: 1800,
        sucursal: "La Paz",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[7],
        tipo: "Transferencia",
        monto: 4000,
        sucursal: "Loreto",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[8],
        tipo: "Depósito",
        monto: 3000,
        sucursal: "Mulegé",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[9],
        tipo: "Retiro",
        monto: 700,
        sucursal: "Los Cabos",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[10],
        tipo: "Transferencia",
        monto: 5000,
        sucursal: "La Paz",
        fecha: new Date(),
      },
      {
        cuentaId: idsCuentas[11],
        tipo: "Pago",
        monto: 1200,
        sucursal: "Mulegé",
        fecha: new Date(),
      },
      
    ]);
await bitacora.insertMany([
  {
    accion: "CONSULTA",
    usuarioId: idsClientes[0],
    estado: "EXITOSO",
    detalle: "Consulta de saldo",
    fecha: new Date(),
  },
  {
    accion: "LOGIN",
    usuarioId: idsClientes[1],
    estado: "EXITOSO",
    detalle: "Inicio de sesión",
    fecha: new Date(),
  },
  {
    accion: "TRANSFERENCIA",
    usuarioId: idsClientes[2],
    estado: "PENDIENTE",
    detalle:
      "Transferencia de prueba",
    fecha: new Date(),
  }
]);
await beneficiarios.insertMany([
  {
    usuarioId: idsClientes[0],
    alias: "Masha",
    cuentaDestino: generarNumeroCuenta(2)
  },
  {
    usuarioId: idsClientes[1],
    alias: "Bernardo",
    cuentaDestino: generarNumeroCuenta(3)
  },
  {
    usuarioId: idsClientes[2],
    alias: "Chiwis",
    cuentaDestino: generarNumeroCuenta(4)
  }
]);
    console.log("Datos insertados");

    const totalClientes = await clientes.countDocuments();
    const totalCuentas = await cuentas.countDocuments();
    const totalTransacciones = await transacciones.countDocuments();
    const totalBitacora =await bitacora.countDocuments();
    const totalBeneficiarios =await beneficiarios.countDocuments();

    console.log("Clientes:", totalClientes);
    console.log("Cuentas:", totalCuentas);
    console.log("Transacciones:", totalTransacciones);
    console.log("Bitacora:", totalBitacora);
    console.log("Beneficiarios:",totalBeneficiarios);

  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

crearBaseDatos();