#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT_DIR = __dirname;
const ENV_FILE = path.join(ROOT_DIR, ".env");
const ENV_EXAMPLE = path.join(ROOT_DIR, ".env.example");

const REQUIRED_FILES = [
  "package.json",
  "crearBaseDeDatos.js",
  "verificar-conexion.js",
  "sincronizar-datos.js",
  "src/index.js",
  "src/config/db.js",
  "src/routes/cuenta.js",
];

function ok(message) {
  console.log(`OK ${message}`);
}

function warn(message) {
  console.log(`AVISO ${message}`);
}

function fail(message) {
  console.log(`FALLO ${message}`);
}

function checkFiles() {
  console.log("\n== Archivos requeridos ==");
  let valid = true;

  for (const file of REQUIRED_FILES) {
    const exists = fs.existsSync(path.join(ROOT_DIR, file));
    if (exists) ok(file);
    else {
      fail(file);
      valid = false;
    }
  }

  return valid;
}

function ensureEnv() {
  console.log("\n== Variables de entorno ==");

  if (fs.existsSync(ENV_FILE)) {
    ok(".env ya existe");
    return true;
  }

  if (!fs.existsSync(ENV_EXAMPLE)) {
    fail("No existe .env.example");
    return false;
  }

  fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
  ok(".env creado desde .env.example");
  return true;
}

function checkDependencies() {
  console.log("\n== Dependencias Node ==");

  if (fs.existsSync(path.join(ROOT_DIR, "node_modules"))) {
    ok("node_modules encontrado");
    return true;
  }

  warn("node_modules no existe. Ejecuta npm install antes de correr la API o los scripts.");
  return false;
}

function checkMongoShell() {
  console.log("\n== Herramientas MongoDB ==");
  const command = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(command, ["mongosh"], { encoding: "utf8" });

  if (result.status === 0) {
    ok("mongosh disponible");
    return true;
  }

  warn("mongosh no esta en PATH. MongoDB puede estar instalado, pero la terminal no lo encuentra.");
  return false;
}

function printNextSteps() {
  console.log(`
== Siguientes pasos ==
1. Verificar MongoDB:
   npm run db:verify

2. Crear datos solo cuando el integrante 1 lo indique:
   npm run db:create

3. Generar backup para compartir datos:
   npm run db:backup

4. Restaurar backup recibido:
   npm run db:restore -- nombre_del_backup --force

Documentos utiles:
  README.md
  INSTALACION_MONGODB.md
  VERIFICACION_DATOS.md
  PROBLEMAS_Y_SOLUCIONES.md
`);
}

function main() {
  console.log("Banco Nexus - setup DevOps local");
  const filesOk = checkFiles();
  const envOk = ensureEnv();
  checkDependencies();
  checkMongoShell();
  printNextSteps();

  if (!filesOk || !envOk) {
    process.exit(1);
  }
}

main();
