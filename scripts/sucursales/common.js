const API_URL = process.env.API_URL || "http://localhost:3000";
const NUMERO_CUENTA = process.env.NUMERO_CUENTA || "2000";

function money(value) {
  return Number(value).toFixed(2);
}

function nowIso() {
  return new Date().toISOString();
}

async function requestJson(path, options = {}) {
  const startedAt = Date.now();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = { raw: await response.text().catch(() => "") };
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
    ms: Date.now() - startedAt,
  };
}

async function consultarCuenta(numeroCuenta = NUMERO_CUENTA) {
  const result = await requestJson(`/api/cuenta/${numeroCuenta}`);
  if (!result.ok) {
    throw new Error(
      `No se pudo consultar cuenta ${numeroCuenta}: HTTP ${result.status} ${JSON.stringify(result.body)}`
    );
  }

  return result.body;
}

async function obtenerSaldo(numeroCuenta = NUMERO_CUENTA) {
  const data = await consultarCuenta(numeroCuenta);
  return Number(data.cuenta.saldo);
}

async function ejecutarOperacion({ sucursal, tipo, monto, numeroCuenta = NUMERO_CUENTA }) {
  const endpoint = tipo === "deposito" ? "/api/deposito" : "/api/retiro";
  const operationId = `${sucursal}-${tipo}-${monto}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

  try {
    const result = await requestJson(endpoint, {
      method: "POST",
      body: JSON.stringify({
        numeroCuenta,
        monto,
        sucursal,
        fecha: nowIso(),
        operationId,
      }),
    });

    return {
      operationId,
      sucursal,
      tipo,
      monto,
      numeroCuenta,
      ok: result.ok,
      status: result.status,
      ms: result.ms,
      body: result.body,
      saldoAnterior: result.body?.saldoAnterior,
      saldoActual: result.body?.saldoActual,
      error: result.ok ? null : result.body?.error || "Error desconocido",
    };
  } catch (error) {
    return {
      operationId,
      sucursal,
      tipo,
      monto,
      numeroCuenta,
      ok: false,
      status: 0,
      ms: 0,
      body: null,
      saldoAnterior: null,
      saldoActual: null,
      error: error.message,
    };
  }
}

async function ejecutarLoteSucursal({ sucursal, operaciones, numeroCuenta = NUMERO_CUENTA }) {
  console.log(`\nSucursal ${sucursal}: ${operaciones.length} operaciones concurrentes`);
  const resultados = await Promise.all(
    operaciones.map((operacion) =>
      ejecutarOperacion({
        sucursal,
        numeroCuenta,
        ...operacion,
      })
    )
  );

  imprimirResultados(resultados);
  return resultados;
}

function calcularEfectoEsperado(resultados) {
  return resultados
    .filter((resultado) => resultado.ok)
    .reduce((total, resultado) => {
      return total + (resultado.tipo === "deposito" ? resultado.monto : -resultado.monto);
    }, 0);
}

function detectarLecturasRepetidas(resultados) {
  const exitosas = resultados.filter(
    (resultado) => resultado.ok && typeof resultado.saldoAnterior === "number"
  );
  const conteo = new Map();

  for (const resultado of exitosas) {
    const key = money(resultado.saldoAnterior);
    conteo.set(key, (conteo.get(key) || 0) + 1);
  }

  return [...conteo.entries()]
    .filter(([, cantidad]) => cantidad > 1)
    .map(([saldo, cantidad]) => ({ saldo: Number(saldo), cantidad }));
}

function analizarConcurrencia({ saldoInicial, saldoFinal, resultados }) {
  const exitosas = resultados.filter((resultado) => resultado.ok);
  const fallidas = resultados.filter((resultado) => !resultado.ok);
  const efectoEsperado = calcularEfectoEsperado(resultados);
  const saldoEsperado = saldoInicial + efectoEsperado;
  const diferencia = saldoFinal - saldoEsperado;
  const lecturasRepetidas = detectarLecturasRepetidas(resultados);
  const hayInconsistencia = Math.abs(diferencia) > 0.0001;

  return {
    totalOperaciones: resultados.length,
    exitosas: exitosas.length,
    fallidas: fallidas.length,
    saldoInicial,
    saldoFinal,
    efectoEsperado,
    saldoEsperado,
    diferencia,
    hayInconsistencia,
    lecturasRepetidas,
  };
}

function imprimirResultados(resultados) {
  for (const resultado of resultados) {
    const estado = resultado.ok ? "OK" : "FALLO";
    const movimiento =
      resultado.ok && typeof resultado.saldoAnterior === "number"
        ? ` saldo ${money(resultado.saldoAnterior)} -> ${money(resultado.saldoActual)}`
        : ` error: ${resultado.error}`;

    console.log(
      `[${estado}] ${resultado.sucursal} ${resultado.tipo} ${money(resultado.monto)} (${resultado.ms} ms)${movimiento}`
    );
  }
}

function imprimirAnalisis(analisis) {
  console.log("\nAnalisis de concurrencia");
  console.log(`Operaciones: ${analisis.totalOperaciones}`);
  console.log(`Exitosas: ${analisis.exitosas}`);
  console.log(`Fallidas: ${analisis.fallidas}`);
  console.log(`Saldo inicial: ${money(analisis.saldoInicial)}`);
  console.log(`Efecto esperado por respuestas OK: ${money(analisis.efectoEsperado)}`);
  console.log(`Saldo esperado: ${money(analisis.saldoEsperado)}`);
  console.log(`Saldo final observado: ${money(analisis.saldoFinal)}`);
  console.log(`Diferencia observada: ${money(analisis.diferencia)}`);

  if (analisis.lecturasRepetidas.length > 0) {
    console.log("Lecturas concurrentes del mismo saldo inicial:");
    for (const lectura of analisis.lecturasRepetidas) {
      console.log(`- saldo ${money(lectura.saldo)} leido ${lectura.cantidad} veces`);
    }
  }

  console.log(
    analisis.hayInconsistencia
      ? "Resultado: hubo inconsistencia de saldo bajo concurrencia."
      : "Resultado: no se detecto inconsistencia de saldo en esta corrida."
  );
}

module.exports = {
  API_URL,
  NUMERO_CUENTA,
  analizarConcurrencia,
  consultarCuenta,
  ejecutarLoteSucursal,
  ejecutarOperacion,
  imprimirAnalisis,
  money,
  obtenerSaldo,
};
