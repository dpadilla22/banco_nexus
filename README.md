# Banco Nexus - Etapa 1

Proyecto academico de base de datos distribuida con cuatro nodos locales. Cada integrante trabaja en su maquina, usando MongoDB local y el mismo repositorio del proyecto.


## Responsabilidades por integrante

| Integrante | Responsabilidad principal |
| --- | --- |
| 1 | Diseno y carga inicial de datos |
| 2 | Backend/API con Express |
| 3 | Frontend React |
| 4 | Instalacion, configuracion, verificacion, sincronizacion y documentacion DevOps |

## Inicio rapido

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` desde la plantilla:

```bash
copy .env.example .env
```

En Linux/macOS:

```bash
cp .env.example .env
```

3. Revisar el entorno:

```bash
npm run setup
```

4. Verificar la base local:

```bash
npm run db:verify
```

5. Crear datos solo cuando corresponda al integrante 1:

```bash
npm run db:create
```

## Comandos DevOps

| Comando | Descripcion |
| --- | --- |
| `npm run setup` | Revisa archivos, `.env`, dependencias y `mongosh` |
| `npm run db:verify` | Verifica conexion, colecciones y relaciones basicas |
| `npm run db:backup` | Genera backup EJSON en `./backups` |
| `npm run db:list-backups` | Lista backups disponibles |
| `npm run db:validate -- nombre_backup` | Valida que el backup tenga colecciones esperadas |
| `npm run db:restore -- nombre_backup --force` | Restaura un backup y reemplaza la base local |

## Configuracion esperada

Archivo `.env`:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=nexus_banca
PORT=3000
```