const { MongoClient } = require("mongodb");
const { EJSON } = require("bson");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ quiet: true });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "nexus_banca";
const BACKUP_DIR = path.join(__dirname, "backups");
const REQUIRED_COLLECTIONS = ["clientes", "cuentas", "transacciones"];

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function withDb(callback) {
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    return await callback(client.db(DB_NAME));
  } finally {
    await client.close().catch(() => {});
  }
}

async function hacerBackup(nameArg) {
  ensureBackupDir();

  return withDb(async (db) => {
    const backupName = nameArg || `backup_${timestamp()}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (fs.existsSync(backupPath)) {
      throw new Error(`Ya existe un backup con ese nombre: ${backupName}`);
    }

    fs.mkdirSync(backupPath, { recursive: true });
    const collections = await db.listCollections().toArray();

    console.log(`Creando backup de ${DB_NAME} en ${backupPath}`);

    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await db.collection(collectionName).find({}).toArray();
      const filePath = path.join(backupPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, EJSON.stringify(data, null, 2), "utf8");
      console.log(`OK ${collectionName}: ${data.length} documentos`);
    }

    const manifest = {
      database: DB_NAME,
      source: MONGO_URI,
      createdAt: new Date().toISOString(),
      collections: collections.map((collection) => collection.name),
    };
    fs.writeFileSync(
      path.join(backupPath, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );

    console.log("Backup completado.");
    return backupPath;
  });
}

async function restaurarBackup(backupName, force) {
  if (!force) {
    throw new Error("Restore detenido. Vuelve a ejecutar con --force para confirmar el borrado de la base local.");
  }

  const backupPath = path.join(BACKUP_DIR, backupName);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup no encontrado: ${backupPath}`);
  }

  const files = fs
    .readdirSync(backupPath)
    .filter((file) => file.endsWith(".json") && file !== "manifest.json");

  return withDb(async (db) => {
    console.log(`Restaurando ${backupName} sobre ${DB_NAME}`);
    await db.dropDatabase();
    console.log("Base de datos local eliminada antes de restaurar.");

    for (const file of files) {
      const collectionName = path.basename(file, ".json");
      const filePath = path.join(backupPath, file);
      const data = EJSON.parse(fs.readFileSync(filePath, "utf8"));

      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data);
      }

      console.log(`OK ${collectionName}: ${data.length} documentos restaurados`);
    }

    console.log("Restore completado.");
  });
}

function listarBackups() {
  ensureBackupDir();
  const backups = fs
    .readdirSync(BACKUP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (backups.length === 0) {
    console.log("No hay backups disponibles.");
    return;
  }

  console.log("Backups disponibles:");
  for (const backup of backups) {
    const backupPath = path.join(BACKUP_DIR, backup);
    const files = fs.readdirSync(backupPath).filter((file) => file.endsWith(".json"));
    console.log(`- ${backup} (${files.length} archivos)`);
  }
}

async function validarBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup no encontrado: ${backupPath}`);
  }

  console.log(`Validando backup ${backupName}`);
  for (const collectionName of REQUIRED_COLLECTIONS) {
    const filePath = path.join(backupPath, `${collectionName}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`FALLO Falta ${collectionName}.json`);
      continue;
    }

    const data = EJSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`OK ${collectionName}: ${data.length} documentos`);
  }
}

function printHelp() {
  console.log(`
Banco Nexus - sincronizacion local de datos

Uso:
  node sincronizar-datos.js backup [nombre]
  node sincronizar-datos.js list
  node sincronizar-datos.js validate <nombre>
  node sincronizar-datos.js restore <nombre> --force

Notas:
  - Los backups se guardan en ./backups.
  - restore borra la base local antes de importar; por eso exige --force.
  - El formato EJSON conserva ObjectId y fechas de MongoDB.
`);
}

async function main() {
  const [command, arg, ...flags] = process.argv.slice(2);

  if (command === "backup") {
    await hacerBackup(arg);
    return;
  }

  if (command === "list" || command === "ls") {
    listarBackups();
    return;
  }

  if (command === "validate") {
    if (!arg) throw new Error("Indica el nombre del backup a validar.");
    await validarBackup(arg);
    return;
  }

  if (command === "restore") {
    if (!arg) throw new Error("Indica el nombre del backup a restaurar.");
    await restaurarBackup(arg, flags.includes("--force"));
    return;
  }

  printHelp();
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
