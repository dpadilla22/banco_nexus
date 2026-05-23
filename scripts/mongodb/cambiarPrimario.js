// Ejecutar contra el primario actual para forzar eleccion:
// docker exec -it banco-mongo-rs mongosh --port <PUERTO_PRIMARY> /tmp/cambiarPrimario.js

const primary = db.hello().primary;
const current = db.hello().me;

print(`Primario actual: ${primary}`);
print(`Nodo conectado: ${current}`);

if (primary !== current) {
  throw new Error("Ejecuta este script en el nodo que actualmente es PRIMARY.");
}

rs.stepDown(60);
