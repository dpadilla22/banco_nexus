# Simulacion paralela de sucursales

Estos scripts cubren la parte de DevOps/sincronizacion: medir diferencias de saldo cuando varias sucursales operan al mismo tiempo contra la API.

No modifican endpoints ni interfaz. Solo consumen:

- `POST /api/deposito`
- `POST /api/retiro`
- `GET /api/cuenta/:numeroCuenta`

## Variables

```powershell
$env:API_URL="http://localhost:3000"
$env:NUMERO_CUENTA="2000"
```

Si no se definen, se usan esos valores por defecto.

## Ejecutar una sucursal

```bash
node scripts/sucursales/operacionSucursalLaPaz.js
node scripts/sucursales/operacionSucursalLosCabos.js
node scripts/sucursales/operacionSucursalLoreto.js
node scripts/sucursales/operacionSucursalMulege.js
```

Cada archivo ejecuta sus propias operaciones con `Promise.all`.

## Consulta desde una sucursal

```bash
node scripts/sucursales/consultaSucursalLaPaz.js
```

## Prueba completa con 4 sucursales

```bash
npm run sucursales:parallel
```

La prueba consulta saldo inicial, ejecuta las 4 sucursales en paralelo y consulta saldo final.

## Como leer el resultado

El analisis compara:

```text
saldo esperado = saldo inicial + depositos OK - retiros OK
```

contra el saldo final observado en la cuenta.

Si la diferencia no es cero, hubo inconsistencia de saldo. Si aparecen varias lecturas del mismo `saldoAnterior`, se detecto que varias operaciones leyeron el mismo saldo antes de escribir; eso normalmente indica colisiones por concurrencia o actualizaciones perdidas.

## Nota sobre replica set

Un replica set replica los datos entre nodos y ayuda con disponibilidad. No elimina por si solo las colisiones de escritura si la aplicacion actualiza saldo con el patron leer-calcular-escribir. Para evitar inconsistencias de saldo, la operacion de saldo deberia ser atomica, por ejemplo con `$inc` y filtros adecuados para retiros. Ese cambio pertenece a la logica de backend, por eso aqui solo se mide y documenta el efecto.
