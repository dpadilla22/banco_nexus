# Problemas comunes y soluciones

Responsable: Integrante 4, DevOps y configuracion.

## 1. MongoDB no responde

Mensaje comun:

```text
connect ECONNREFUSED 127.0.0.1:27017
Server selection timed out
```

Solucion en Windows:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

Tambien se puede abrir `services.msc`, buscar `MongoDB` e iniciar el servicio.

Solucion en Linux:

```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

Solucion en macOS:

```bash
brew services list
brew services start mongodb-community
```

## 2. `mongosh` no se reconoce

Mensaje comun:

```text
'mongosh' is not recognized
```

Soluciones:

- Instalar MongoDB Shell.
- Agregar la carpeta `bin` de MongoDB al PATH.
- Reiniciar la terminal despues de modificar PATH.

## 3. Puerto 27017 ocupado

Windows:

```powershell
netstat -ano | findstr :27017
```

Linux/macOS:

```bash
lsof -i :27017
```

Si el proceso es MongoDB, no es un error: significa que el servicio esta escuchando. Si es otro proceso, detenerlo o acordar otro puerto con todo el equipo.

## 4. Falta `.env`

Crear el archivo desde la plantilla:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Contenido minimo:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_banca
PORT=3000
```

## 5. La base conecta, pero no hay colecciones

Esto indica que MongoDB funciona, pero los datos no han sido cargados.

Acciones:

1. Confirmar con el integrante 1 si ya se debe ejecutar la carga.
2. Ejecutar `npm run db:create` solo cuando corresponda.
3. Verificar de nuevo:

```bash
npm run db:verify
```

## 6. Los conteos no coinciden entre integrantes

Acciones:

1. Todos ejecutan `npm run db:verify`.
2. Se anotan los conteos en `VERIFICACION_DATOS.md`.
3. El nodo con datos correctos crea backup:

```bash
npm run db:backup
```

4. Los nodos desactualizados restauran:

```bash
npm run db:restore -- nombre_del_backup --force
```

5. Todos vuelven a ejecutar:

```bash
npm run db:verify
```

## 7. Error por datos duplicados

Mensaje comun:

```text
E11000 duplicate key error
```

Causa probable: se ejecuto el script de carga mas de una vez o existen indices unicos.

Acciones:

- No borrar datos sin avisar al equipo.
- Hacer backup primero si hay informacion que conservar.
- Acordar con el integrante 1 si se limpia y se vuelve a cargar.

## 8. Restore bloqueado por falta de `--force`

Mensaje:

```text
Restore detenido. Vuelve a ejecutar con --force
```

Es intencional. Restaurar borra la base local antes de importar.

Comando correcto:

```bash
npm run db:restore -- nombre_del_backup --force
```

## 9. La API no encuentra datos

Verificar primero que la base tenga datos:

```bash
npm run db:verify
```

Luego revisar que API y scripts usen la misma base:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_banca
```

Si la verificacion pasa pero la API falla, corresponde revisar con el integrante 2.

## 10. El frontend no muestra informacion

Orden recomendado:

1. Verificar base de datos con `npm run db:verify`.
2. Verificar API con `npm run dev`.
3. Probar endpoint de cuenta.
4. Si API responde bien, revisar con el integrante 3.

## Diagnostico rapido

```bash
npm run setup
npm run db:verify
```

Registrar cualquier fallo en `VERIFICACION_DATOS.md`.
