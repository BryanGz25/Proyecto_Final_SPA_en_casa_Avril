const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const PERIODOS = {
  dia: { etiqueta: "Por día", alcance: "Semana actual" },
  semana: { etiqueta: "Por semana", alcance: "Mes actual" },
  mes: { etiqueta: "Por mes", alcance: "Año actual" },
  ano: { etiqueta: "Por año", alcance: "Histórico" },
};

const ESTADOS_EXCLUIDOS = new Set(["cancelado", "cancelada"]);

const totalDe = (pedido) => Number(pedido.total) || 0;

const aFecha = (pedido) => {
  const fecha = new Date(pedido.fecha);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const pad = (numero) => String(numero).padStart(2, "0");

const claveDia = (fecha) =>
  `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

const claveMes = (fecha) => `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

const claveSemana = (fecha) =>
  `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${Math.ceil(fecha.getDate() / 7)}`;

/**
 * Un pedido cuenta como ingreso salvo que esté cancelado o no tenga fecha
 * válida. Los estados "pendiente" y "en preparacion" sí se acumulan: el
 * dashboard muestra el desglose por estado para que el dato sea auditable.
 */
export function pedidosDeIngreso(pedidos) {
  return (Array.isArray(pedidos) ? pedidos : [])
    .map((pedido) => ({ pedido, fecha: aFecha(pedido) }))
    .filter(
      ({ pedido, fecha }) =>
        fecha &&
        !ESTADOS_EXCLUIDOS.has(String(pedido.estado || "").trim().toLowerCase())
    );
}

const acumular = (registros, filas, claveDe) => {
  const indice = new Map(filas.map((fila, i) => [fila.clave, i]));

  for (const { pedido, fecha } of registros) {
    const i = indice.get(claveDe(fecha));

    if (i === undefined) continue;

    filas[i].monto += totalDe(pedido);
    filas[i].pedidos += 1;
  }

  return filas;
};

const porDiaDeSemana = (registros, referencia) => {
  const desplazamiento = (referencia.getDay() + 6) % 7;
  const lunes = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    referencia.getDate() - desplazamiento
  );

  const filas = DIAS.map((etiqueta, i) => ({
    clave: claveDia(new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i)),
    etiqueta,
    monto: 0,
    pedidos: 0,
  }));

  return acumular(registros, filas, claveDia);
};

const porSemanaDelMes = (registros, referencia) => {
  const anio = referencia.getFullYear();
  const mes = referencia.getMonth();
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const semanas = Math.ceil(diasDelMes / 7);

  const filas = Array.from({ length: semanas }, (_, i) => ({
    clave: `${anio}-${mes + 1}-${i + 1}`,
    etiqueta: `Sem ${i + 1}`,
    monto: 0,
    pedidos: 0,
  }));

  return acumular(registros, filas, claveSemana);
};

const porMesDelAnio = (registros, referencia) => {
  const anio = referencia.getFullYear();

  const filas = MESES.map((etiqueta, i) => ({
    clave: `${anio}-${i + 1}`,
    etiqueta,
    monto: 0,
    pedidos: 0,
  }));

  return acumular(registros, filas, claveMes);
};

const porAnio = (registros) => {
  const anios = [
    ...new Set(registros.map(({ fecha }) => fecha.getFullYear())),
  ].sort((a, b) => a - b);

  const filas = anios.map((anio) => ({
    clave: String(anio),
    etiqueta: String(anio),
    monto: 0,
    pedidos: 0,
  }));

  return acumular(registros, filas, (fecha) => String(fecha.getFullYear()));
};

/**
 * Agrupa los ingresos reales por el periodo pedido.
 * Devuelve las filas del gráfico más el resumen para las tarjetas y las
 * exportaciones.
 */
export function calcularIngresos(pedidos, periodo = "mes", referencia = new Date()) {
  const registros = pedidosDeIngreso(pedidos);

  let filas;

  switch (periodo) {
    case "dia":
      filas = porDiaDeSemana(registros, referencia);
      break;
    case "semana":
      filas = porSemanaDelMes(registros, referencia);
      break;
    case "ano":
      filas = porAnio(registros);
      break;
    case "mes":
    default:
      filas = porMesDelAnio(registros, referencia);
  }

  const conActividad = filas.filter((fila) => fila.pedidos > 0);

  const total = filas.reduce((suma, fila) => suma + fila.monto, 0);
  const cantidadPedidos = conActividad.reduce((suma, fila) => suma + fila.pedidos, 0);

  const mejor = conActividad.reduce(
    (top, fila) => (!top || fila.monto > top.monto ? fila : top),
    null
  );

  return {
    periodo,
    filas: filas.map((fila) => ({
      ...fila,
      porcentaje: total > 0 ? (fila.monto / total) * 100 : 0,
    })),
    total,
    cantidadPedidos,
    ticketPromedio: cantidadPedidos > 0 ? total / cantidadPedidos : 0,
    mejor: mejor ? { etiqueta: mejor.etiqueta, monto: mejor.monto } : null,
    maxMonto: filas.reduce((max, fila) => Math.max(max, fila.monto), 0),
  };
}

export function desglosePorEstado(pedidos) {
  const conteo = new Map();

  for (const pedido of Array.isArray(pedidos) ? pedidos : []) {
    if (!pedido) continue;

    const estado = String(pedido.estado || "pendiente").trim();
    const previo = conteo.get(estado) || { estado, pedidos: 0, monto: 0 };

    previo.pedidos += 1;
    previo.monto += totalDe(pedido);
    conteo.set(estado, previo);
  }

  return [...conteo.values()].sort((a, b) => b.monto - a.monto);
}

export const nombrePeriodo = (periodo) =>
  PERIODOS[periodo] || PERIODOS.mes;
