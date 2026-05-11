# Instalacion de MongoDB - Banco Nexus

Guia para preparar MongoDB local en los cuatro nodos del equipo. La practica usa una conexion simple a `mongodb://localhost:27017`, sin replica set.

## Requisitos

- Node.js instalado.
- Acceso de administrador para instalar servicios.
- MongoDB Community Server.
- MongoDB Shell (`mongosh`) recomendado para pruebas manuales.

## Windows 10/11

1. Descargar MongoDB Community Server:
   https://www.mongodb.com/try/download/community

2. Seleccionar:
   - Version: estable reciente.
   - Platform: Windows.
   - Package: MSI.

3. Durante la instalacion:
   - Elegir instalacion completa.
   - Marcar `Install MongoDB as a Service`.
   - Usar `Run service as Network Service user`.
   - Mantener el puerto por defecto `27017`.

4. Verificar servicio:
   - Abrir `services.msc`.
   - Buscar `MongoDB`.
   - Confirmar estado `Running` o `En ejecucion`.

5. Probar desde terminal:

```powershell
mongosh
show dbs
exit
```

## Linux Ubuntu/Debian

La forma exacta puede cambiar por version de distribucion. Si el paquete oficial no esta disponible, usar la guia vigente de MongoDB para la distribucion.

Prueba rapida cuando el servicio ya esta instalado:

```bash
sudo systemctl status mongod
sudo systemctl start mongod
mongosh
```

En algunas instalaciones el servicio se llama `mongodb` en lugar de `mongod`.

## macOS

Con Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh
```

## Configuracion del proyecto

Crear `.env` en la raiz del proyecto:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_banca
PORT=3000
```

Tambien se puede copiar la plantilla:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Verificacion

Desde la raiz del repositorio:

```bash
npm install
npm run setup
npm run db:verify
```

Resultados esperados:

- MongoDB responde en `mongodb://localhost:27017`.
- La base seleccionada es `nexus_banca`.
- Existen las colecciones `clientes`, `cuentas` y `transacciones` despues de cargar datos.
- Las relaciones basicas cliente-cuenta-transaccion no presentan referencias rotas.

## Puertos

| Servicio | Puerto | Responsable |
| --- | --- | --- |
| MongoDB | 27017 | Integrante 4 documenta; todos instalan |
| API Express | 3000 | Integrante 2 |
| Frontend Vite | 5173 por defecto | Integrante 3 |

## Notas para el equipo

- No cambiar `MONGO_URI` sin avisar a todos.
- No subir `.env` al repositorio.
- Antes de restaurar datos, hacer backup si hay informacion local que se quiera conservar.
- Si MongoDB conecta pero no hay datos, eso no es fallo de instalacion: falta ejecutar o restaurar la carga definida por el integrante 1.
