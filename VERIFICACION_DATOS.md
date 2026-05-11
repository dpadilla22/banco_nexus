# Protocolo de verificacion de datos

Objetivo: comprobar que los cuatro nodos locales tienen MongoDB funcionando y la misma version de datos para la Etapa 1.

## Comando principal de verificacion

```bash
npm run db:verify
```

Este comando revisa:

- Conexion a MongoDB.
- Base de datos configurada.
- Existencia de colecciones requeridas.
- Conteo de documentos.
- Duplicados en `curp` y `numeroCuenta`.
- Relacion `cuentas.clienteId -> clientes._id`.
- Relacion `transacciones.cuentaId -> cuentas._id`.


## Verificacion manual opcional

```bash
mongosh
use nexus_banca
db.clientes.countDocuments()
db.cuentas.countDocuments()
db.transacciones.countDocuments()
```

Revisar una cuenta con cliente:

```javascript
db.cuentas.aggregate([
  {
    $lookup: {
      from: "clientes",
      localField: "clienteId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  { $limit: 3 }
])
```

Revisar transacciones con cuenta:

```javascript
db.transacciones.aggregate([
  {
    $lookup: {
      from: "cuentas",
      localField: "cuentaId",
      foreignField: "_id",
      as: "cuenta"
    }
  },
  { $limit: 3 }
])
```

## Sincronizacion por backup

En la maquina que tiene los datos correctos:

```bash
npm run db:backup
npm run db:list-backups
```

Compartir la carpeta generada dentro de `backups/`.

En la maquina que necesita restaurar:

```bash
npm run db:validate -- nombre_del_backup
npm run db:restore -- nombre_del_backup --force
npm run db:verify
```

Importante: `restore` borra la base local antes de importar. Por eso exige `--force`.

## Criterios de aceptacion

La verificacion se considera exitosa cuando:

- Se pueda ejecutar `npm run db:verify`.
- Las tres colecciones requeridas existen.
- Los conteos coinciden entre los cuatro nodos.
- No hay duplicados en campos clave.
- No hay referencias rotas entre clientes, cuentas y transacciones.
- Las incidencias quedan documentadas en esta bitacora.