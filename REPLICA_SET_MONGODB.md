# Replica Set MongoDB Local - Banco Nexus

Esta guia configura nodos MongoDB locales en Docker con replica set `rsBanco`.

## 1. Levantar los nodos

Desde la raiz del proyecto:

```powershell
docker compose up -d
```

Puertos:

| Nodo | Contenedor | Puerto local | Puerto interno |
| --- | --- | --- | --- |
| 1 | `banco-mongo-rs` | `27017` | `27017` |
| 2 | `banco-mongo-rs` | `27018` | `27018` |
| 3 | `banco-mongo-rs` | `27019` | `27019` |

## 2. Ejecutar `rs.initiate()`

Copiar los scripts al contenedor y ejecutar la inicializacion una sola vez:

```powershell
docker cp scripts/mongodb/iniciarReplica.js banco-mongo-rs:/tmp/iniciarReplica.js
docker exec -it banco-mongo-rs mongosh --port 27017 /tmp/iniciarReplica.js
```

El script ejecuta:

```javascript
rs.initiate({
  _id: "rsBanco",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});
```

Nota Docker: este laboratorio ejecuta procesos `mongod` dentro del mismo contenedor para que `localhost:27017`, `localhost:27018` y `localhost:27019` sean validos tanto dentro del replica set como desde Node.js. Desde Node.js se usan los puertos locales publicados en `.env`:

```env
MONGO_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/nexus_banca?replicaSet=rsBanco
DB_NAME=nexus_banca
PORT=3000
```

## 3. Verificar estado del replica set

```powershell
docker cp scripts/mongodb/estadoReplica.js banco-mongo-rs:/tmp/estadoReplica.js
docker exec -it banco-mongo-rs mongosh --port 27017 /tmp/estadoReplica.js
```

Resultado esperado:

- 1 nodo en estado `PRIMARY`.
- 2 nodos en estado `SECONDARY`.
- `health: 1` en los miembros.

Tambien se puede consultar directo:

```powershell
docker exec -it banco-mongo-rs mongosh --port 27017 --eval "rs.status()"
```

## 4. Cargar datos y probar la app

Con el replica set iniciado:

```powershell
npm run db:create
npm run db:verify
npm start
```

La API debe conectarse con la URI del replica set y seguir usando la base `nexus_banca`.

## 5. Cambiar el nodo primario

Primero identifica el primario:

```powershell
docker exec -it banco-mongo-rs mongosh --port 27017 --eval "db.hello().primary"
```

Si el primario es `localhost:27017`, ejecuta:

```powershell
docker cp scripts/mongodb/cambiarPrimario.js banco-mongo-rs:/tmp/cambiarPrimario.js
docker exec -it banco-mongo-rs mongosh --port 27017 /tmp/cambiarPrimario.js
```

Si el primario es otro puerto, cambia `--port`:

```powershell
docker exec -it banco-mongo-rs mongosh --port 27018 /tmp/cambiarPrimario.js
```

o:

```powershell
docker exec -it banco-mongo-rs mongosh --port 27019 /tmp/cambiarPrimario.js
```

Luego observa la nueva eleccion:

```powershell
docker exec -it banco-mongo-rs mongosh --port 27017 --eval "rs.status().members.map(m => ({name: m.name, stateStr: m.stateStr}))"
```

## 6. Comportamiento esperado del sistema

Al ejecutar `rs.stepDown(60)` sobre el primario:

- El primario deja de aceptar escrituras por unos segundos.
- Los secundarios hacen una nueva eleccion.
- Uno de los secundarios pasa a `PRIMARY`.
- La URI de la app contiene los 3 hosts, por lo que el driver de MongoDB descubre el nuevo primario.
- Durante la eleccion puede haber una pausa corta o un error temporal de seleccion de servidor.
- Despues de la eleccion, lecturas y escrituras vuelven a operar sin cambiar la configuracion de Node.js.

## 7. Evidencia de ejecucion local

Estado inicial despues de `rs.initiate()`:

```text
localhost:27017 PRIMARY
localhost:27018 SECONDARY
localhost:27019 SECONDARY
```

Despues de ejecutar `rs.stepDown(60)` contra `localhost:27017`:

```text
localhost:27017 SECONDARY
localhost:27018 PRIMARY
localhost:27019 SECONDARY
```

Verificacion desde Node.js despues del cambio de primario:

```text
OK MongoDB responde en mongodb://localhost:27017,localhost:27018,localhost:27019/nexus_banca?replicaSet=rsBanco
OK clientes: 12
OK cuentas: 12
OK transacciones: 12
OK Verificacion completada sin errores.
```

Observacion: los procesos que usan la URI con los hosts y `replicaSet=rsBanco` descubren automaticamente el nuevo primario. Un script que escriba directo a `mongodb://localhost:27017` puede fallar despues del cambio si `27017` queda como `SECONDARY`.
