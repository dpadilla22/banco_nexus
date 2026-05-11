const { MongoClient } = require("mongodb");
require("dotenv").config({ quiet: true });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "nexus_banca";
const REQUIRED_COLLECTIONS = ["clientes", "cuentas", "transacciones"];
const EXPECTED_COUNTS = {
  clientes: Number(process.env.EXPECTED_CLIENTES || 0),
  cuentas: Number(process.env.EXPECTED_CUENTAS || 0),
  transacciones: Number(process.env.EXPECTED_TRANSACCIONES || 0),
};

function status(ok) {
  return ok ? "OK" : "FALLO";
}

function printSection(title) {
  console.log(`\n== ${title} ==`);
}

async function countDuplicates(collection, field) {
  return collection
    .aggregate([
      { $group: { _id: `$${field}`, total: { $sum: 1 } } },
      { $match: { _id: { $ne: null }, total: { $gt: 1 } } },
      { $count: "duplicados" },
    ])
    .toArray();
}

async function verificarConexion() {
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  let hasFailure = false;

  try {
    printSection("Conexion");
    await client.connect();
    console.log(`${status(true)} MongoDB responde en ${MONGO_URI}`);
    console.log(`${status(true)} Base de datos seleccionada: ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    printSection("Colecciones");
    for (const collectionName of REQUIRED_COLLECTIONS) {
      if (!collectionNames.includes(collectionName)) {
        hasFailure = true;
        console.log(`${status(false)} Falta la coleccion "${collectionName}"`);
        continue;
      }

      const total = await db.collection(collectionName).countDocuments();
      const expected = EXPECTED_COUNTS[collectionName];
      const expectedText = expected > 0 ? ` / esperado: ${expected}` : "";
      const countOk = expected === 0 || total === expected;
      hasFailure = hasFailure || !countOk;

      console.log(`${status(countOk)} ${collectionName}: ${total}${expectedText}`);
    }

    printSection("Integridad basica");
    const clientes = db.collection("clientes");
    const cuentas = db.collection("cuentas");
    const transacciones = db.collection("transacciones");

    if (collectionNames.includes("clientes")) {
      const duplicatedCurps = await countDuplicates(clientes, "curp");
      const ok = duplicatedCurps.length === 0;
      hasFailure = hasFailure || !ok;
      console.log(`${status(ok)} CURP sin duplicados`);
    }

    if (collectionNames.includes("cuentas")) {
      const duplicatedAccounts = await countDuplicates(cuentas, "numeroCuenta");
      const ok = duplicatedAccounts.length === 0;
      hasFailure = hasFailure || !ok;
      console.log(`${status(ok)} numeroCuenta sin duplicados`);
    }

    if (collectionNames.includes("cuentas") && collectionNames.includes("clientes")) {
      const cuentasSinCliente = await cuentas
        .aggregate([
          {
            $lookup: {
              from: "clientes",
              localField: "clienteId",
              foreignField: "_id",
              as: "cliente",
            },
          },
          { $match: { cliente: { $size: 0 } } },
          { $count: "total" },
        ])
        .toArray();
      const ok = cuentasSinCliente.length === 0;
      hasFailure = hasFailure || !ok;
      console.log(`${status(ok)} Todas las cuentas tienen cliente asociado`);
    }

    if (collectionNames.includes("transacciones") && collectionNames.includes("cuentas")) {
      const transaccionesSinCuenta = await transacciones
        .aggregate([
          {
            $lookup: {
              from: "cuentas",
              localField: "cuentaId",
              foreignField: "_id",
              as: "cuenta",
            },
          },
          { $match: { cuenta: { $size: 0 } } },
          { $count: "total" },
        ])
        .toArray();
      const ok = transaccionesSinCuenta.length === 0;
      hasFailure = hasFailure || !ok;
      console.log(`${status(ok)} Todas las transacciones tienen cuenta asociada`);
    }

    printSection("Servidor");
    const serverStatus = await db.admin().serverStatus();
    console.log(`Version MongoDB: ${serverStatus.version}`);
    console.log(`Conexiones activas: ${serverStatus.connections.current}`);

    printSection("Resultado");
    if (hasFailure) {
      console.log("FALLO La verificacion encontro diferencias o datos incompletos.");
      console.log("Revisar VERIFICACION_DATOS.md y PROBLEMAS_Y_SOLUCIONES.md.");
      return false;
    }

    console.log("OK Verificacion completada sin errores.");
    return true;
  } catch (error) {
    printSection("Error");
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);

    if (error.message.includes("ECONNREFUSED") || error.message.includes("Server selection timed out")) {
      console.error("MongoDB no esta ejecutandose o no escucha en la URI configurada.");
      console.error("Windows: revisar el servicio MongoDB en services.msc.");
      console.error("Linux/macOS: revisar el servicio con systemctl o brew services.");
    }

    console.error("Guia: PROBLEMAS_Y_SOLUCIONES.md");
    return false;
  } finally {
    await client.close().catch(() => {});
  }
}

verificarConexion()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
