import { PERIODOS } from "./ingresos";

const COLORES = {
  verde: "#4a5d4e",
  verdeOscuro: "#334537",
  arena: "#e8e2d8",
  crema: "#fdfbf7",
  texto: "#191c1a",
  muted: "#6e7570",
  borde: "#d8d2c6",
};

const blancoPdf = [255, 255, 255];
const separador = " · ";

const argb = (hex) => `FF${hex.replace("#", "").toUpperCase()}`;

export const formatearMoneda = (monto) =>
  `₡${(Number(monto) || 0).toLocaleString("es-CR")}`;

export const formatearPorcentaje = (valor) => `${(Number(valor) || 0).toFixed(1)} %`;

const fechaCorta = (fecha) => {
  const d = fecha instanceof Date ? fecha : new Date(fecha);

  if (Number.isNaN(d.getTime())) return "Fecha desconocida";

  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const marcaDeTiempo = () => {
  const ahora = new Date();

  return `${fechaCorta(ahora)} ${String(ahora.getHours()).padStart(
    2,
    "0"
  )}:${String(ahora.getMinutes()).padStart(2, "0")}`;
};

const nombreArchivo = (periodo, extension) =>
  `ingresos-${periodo}-${new Date().toISOString().slice(0, 10)}.${extension}`;

const descargar = (blob, nombre) => {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const pedidosOrdenados = (pedidos) =>
  (Array.isArray(pedidos) ? pedidos : [])
    .filter((pedido) => pedido)
    .slice()
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

const articulosDe = (pedido) =>
  (Array.isArray(pedido?.productos) ? pedido.productos : []).reduce(
    (suma, item) => suma + (Number(item?.cantidad) || 1),
    0
  );

const clienteDe = (pedido) =>
  pedido?.cliente?.nombre || pedido?.usuario || "Sin especificar";

const metaDe = (periodo) => PERIODOS[periodo] || PERIODOS.mes;

const alcanceDe = (periodo) => {
  const meta = metaDe(periodo);

  return `${meta.etiqueta}${separador}${meta.alcance}`;
};

const resumenEnPares = (analisis, periodo) => {
  const pares = [
    ["Periodo analizado", alcanceDe(periodo)],
    ["Total de ingresos", formatearMoneda(analisis.total)],
    ["Pedidos contados", String(analisis.cantidadPedidos)],
    ["Ticket promedio", formatearMoneda(analisis.ticketPromedio)],
    ["Generado", marcaDeTiempo()],
  ];

  pares.push([
    "Mejor periodo",
    analisis.mejor
      ? `${analisis.mejor.etiqueta}${separador}${formatearMoneda(
          analisis.mejor.monto
        )}`
      : "Sin datos",
  ]);

  return pares;
};

// ─────────────────────────────  EXCEL  ─────────────────────────────

export async function exportarIngresosExcel({
  analisis,
  pedidos,
  periodo,
  desglose = [],
}) {
  const modulo = await import("exceljs");
  const ExcelJS = modulo.default || modulo;
  const libro = new ExcelJS.Workbook();
  const formatoMoneda = '"₡" #,##0';
  const meta = metaDe(periodo);

  libro.creator = "Panel Avrill";
  libro.created = new Date();

  const bordesFinos = {
    top: { style: "thin", color: { argb: argb(COLORES.borde) } },
    left: { style: "thin", color: { argb: argb(COLORES.borde) } },
    bottom: { style: "thin", color: { argb: argb(COLORES.borde) } },
    right: { style: "thin", color: { argb: argb(COLORES.borde) } },
  };

  const titulo = (hoja, texto) => {
    hoja.mergeCells("A1:D1");

    const celda = hoja.getCell("A1");

    celda.value = texto;
    celda.font = {
      bold: true,
      size: 15,
      color: { argb: argb(COLORES.verdeOscuro) },
    };
    celda.alignment = { vertical: "middle" };
  };

  const subtitulo = (hoja, texto) => {
    hoja.mergeCells("A2:D2");

    const celda = hoja.getCell("A2");

    celda.value = texto;
    celda.font = { italic: true, size: 10, color: { argb: argb(COLORES.muted) } };
  };

  const encabezado = (fila) => {
    fila.height = 22;

    fila.eachCell((celda) => {
      celda.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: argb(COLORES.verdeOscuro) },
      };
      celda.alignment = { vertical: "middle", horizontal: "center" };
    });
  };

  const rellenar = (celda) => {
    celda.border = bordesFinos;
  };

  // Hoja 1: resumen
  const resumen = libro.addWorksheet("Resumen");

  titulo(resumen, "Análisis de Ingresos · Panel Avrill");
  subtitulo(
    resumen,
    `${alcanceDe(periodo)} · Generado ${marcaDeTiempo()}`
  );

  const encabezadoResumen = resumen.getRow(4);

  encabezadoResumen.values = ["Indicador", "Valor"];
  encabezado(encabezadoResumen);

  resumenEnPares(analisis, periodo).forEach(([indicador, valor], indice) => {
    const fila = resumen.getRow(5 + indice);
    const esDinero = /ingresos|promedio/i.test(indicador);

    fila.getCell(1).value = indicador;
    fila.getCell(1).font = { bold: true };
    fila.getCell(2).value = valor;

    if (esDinero) {
      fila.getCell(2).font = {
        bold: true,
        color: { argb: argb(COLORES.verdeOscuro) },
      };
    }

    rellenar(fila.getCell(1));
    rellenar(fila.getCell(2));
  });

  resumen.columns = [{ width: 26 }, { width: 36 }];

  // Hoja 2: ingresos por periodo
  const detalle = libro.addWorksheet("Ingresos");

  titulo(
    detalle,
    `Ingresos por periodo · ${analisis.filas.length} ${
      analisis.filas.length === 1 ? "periodo" : "periodos"
    }`
  );
  subtitulo(detalle, alcanceDe(periodo));

  detalle.views = [{ state: "frozen", ySplit: 4 }];

  const encabezadoDetalle = detalle.getRow(4);

  encabezadoDetalle.values = ["Periodo", "Pedidos", "Ingresos", "% del total"];
  encabezado(encabezadoDetalle);

  analisis.filas.forEach((fila, indice) => {
    const r = detalle.getRow(5 + indice);

    r.getCell(1).value = fila.etiqueta;
    r.getCell(2).value = fila.pedidos;
    r.getCell(3).value = fila.monto;
    r.getCell(4).value = fila.porcentaje / 100;
    r.getCell(3).numFmt = formatoMoneda;
    r.getCell(4).numFmt = "0.0%";
    r.getCell(2).alignment = { horizontal: "center" };

    if (fila.pedidos === 0) {
      for (let c = 1; c <= 4; c++) {
        r.getCell(c).font = { color: { argb: argb(COLORES.muted) } };
      }
    }

    for (let c = 1; c <= 4; c++) rellenar(r.getCell(c));
  });

  const ultimaFila = 4 + analisis.filas.length;
  const total = detalle.getRow(ultimaFila + 1);

  total.getCell(1).value = "TOTAL";
  total.getCell(2).value = { formula: `SUM(B5:B${ultimaFila})` };
  total.getCell(3).value = { formula: `SUM(C5:C${ultimaFila})` };
  total.getCell(3).numFmt = formatoMoneda;

  total.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: argb(COLORES.verde) },
    };
  });

  detalle.autoFilter = { from: "A4", to: `D${ultimaFila}` };
  detalle.columns = [{ width: 16 }, { width: 12 }, { width: 20 }, { width: 14 }];

  // Hoja 3: por estado
  if (desglose.length > 0) {
    const hojaEstado = libro.addWorksheet("Por estado");

    titulo(hojaEstado, "Ingresos por estado del pedido");
    subtitulo(hojaEstado, alcanceDe(periodo));

    const encabezadoEstado = hojaEstado.getRow(4);

    encabezadoEstado.values = ["Estado", "Pedidos", "Monto"];
    encabezado(encabezadoEstado);

    desglose.forEach((item, indice) => {
      const r = hojaEstado.getRow(5 + indice);

      r.getCell(1).value = item.estado;
      r.getCell(2).value = item.pedidos;
      r.getCell(3).value = item.monto;
      r.getCell(3).numFmt = formatoMoneda;
      r.getCell(2).alignment = { horizontal: "center" };

      for (let c = 1; c <= 3; c++) rellenar(r.getCell(c));
    });

    hojaEstado.columns = [{ width: 20 }, { width: 12 }, { width: 20 }];
  }

  // Hoja 4: detalle de pedidos
  const lista = pedidosOrdenados(pedidos);

  if (lista.length > 0) {
    const hojaPedidos = libro.addWorksheet("Pedidos");

    titulo(hojaPedidos, "Detalle de pedidos");
    subtitulo(
      hojaPedidos,
      `${lista.length} pedidos ordenados del más reciente al más antiguo`
    );
    hojaPedidos.views = [{ state: "frozen", ySplit: 4 }];

    const encabezadoPedidos = hojaPedidos.getRow(4);

    encabezadoPedidos.values = [
      "Fecha",
      "Pedido",
      "Cliente",
      "Correo",
      "Estado",
      "Artículos",
      "Total",
    ];
    encabezado(encabezadoPedidos);

    lista.forEach((pedido, indice) => {
      const r = hojaPedidos.getRow(5 + indice);

      r.getCell(1).value = fechaCorta(pedido.fecha);
      r.getCell(2).value = pedido.id ?? "—";
      r.getCell(3).value = clienteDe(pedido);
      r.getCell(4).value = pedido.cliente?.correo || "—";
      r.getCell(5).value = pedido.estado || "pendiente";
      r.getCell(6).value = articulosDe(pedido);
      r.getCell(7).value = Number(pedido.total) || 0;
      r.getCell(7).numFmt = formatoMoneda;
      r.getCell(6).alignment = { horizontal: "center" };

      for (let c = 1; c <= 7; c++) rellenar(r.getCell(c));
    });

    hojaPedidos.autoFilter = { from: "A4", to: `G${4 + lista.length}` };
    hojaPedidos.columns = [
      { width: 13 },
      { width: 16 },
      { width: 24 },
      { width: 26 },
      { width: 15 },
      { width: 11 },
      { width: 18 },
    ];
  }

  const buffer = await libro.xlsx.writeBuffer();

  descargar(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    nombreArchivo(periodo, "xlsx")
  );

  return { hojas: libro.worksheets.length, pedidos: lista.length, meta };
}

// ──────────────────────────────  PDF  ──────────────────────────────

/**
 * Dibuja el gráfico de barras con Canvas 2D. Es más fiable que serializar a
 * imagen el SVG que produce Recharts, que suele fallar por fuentes y estilos
 * externos, y así el PDF no depende de que la pantalla esté visible.
 */
function dibujarGrafico(filas, ancho = 700, alto = 240) {
  const escala = 2;
  const lienzo = document.createElement("canvas");

  lienzo.width = ancho * escala;
  lienzo.height = alto * escala;

  const ctx = lienzo.getContext("2d");

  ctx.scale(escala, escala);
  ctx.fillStyle = COLORES.crema;
  ctx.fillRect(0, 0, ancho, alto);

  const margen = { arriba: 20, derecha: 14, abajo: 32, izquierda: 58 };
  const areaAncho = ancho - margen.izquierda - margen.derecha;
  const areaAlto = alto - margen.arriba - margen.abajo;
  const maxMonto = Math.max(...filas.map((fila) => fila.monto), 1);
  const hayDatos = filas.some((fila) => fila.monto > 0);

  ctx.strokeStyle = COLORES.arena;
  ctx.fillStyle = COLORES.muted;
  ctx.lineWidth = 1;
  ctx.font = "10px Consolas, monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i++) {
    const y = margen.arriba + (areaAlto / 4) * i;

    ctx.beginPath();
    ctx.moveTo(margen.izquierda, y);
    ctx.lineTo(margen.izquierda + areaAncho, y);
    ctx.stroke();

    ctx.fillText(
      Math.round(maxMonto * (1 - i / 4)).toLocaleString("es-CR"),
      margen.izquierda - 8,
      y
    );
  }

  if (!hayDatos) {
    ctx.textAlign = "center";
    ctx.fillStyle = COLORES.muted;
    ctx.font = "italic 12px sans-serif";
    ctx.fillText(
      "Sin ingresos registrados en este periodo",
      ancho / 2,
      alto / 2
    );

    return lienzo;
  }

  const hueco = 10;
  const anchoBarra = Math.max(
    5,
    (areaAncho - hueco * Math.max(0, filas.length - 1)) / Math.max(1, filas.length)
  );

  filas.forEach((fila, indice) => {
    const x = margen.izquierda + indice * (anchoBarra + hueco);
    const alto = (fila.monto / maxMonto) * areaAlto;
    const y = margen.arriba + areaAlto - alto;
    const vacio = fila.monto <= 0;

    if (vacio) {
      ctx.fillStyle = COLORES.arena;
      ctx.fillRect(x, margen.arriba + areaAlto - 3, anchoBarra, 3);
    } else {
      const gradiente = ctx.createLinearGradient(0, y, 0, margen.arriba + areaAlto);

      gradiente.addColorStop(0, COLORES.verde);
      gradiente.addColorStop(1, COLORES.verdeOscuro);

      ctx.fillStyle = gradiente;
      ctx.beginPath();
      ctx.roundRect(x, y, anchoBarra, Math.max(alto, 2), 3);
      ctx.fill();
    }

    ctx.fillStyle = COLORES.texto;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(fila.etiqueta, x + anchoBarra / 2, margen.arriba + areaAlto + 9);
  });

  return lienzo;
}

export async function exportarIngresosPdf({
  analisis,
  pedidos,
  periodo,
  desglose = [],
}) {
  const [{ jsPDF }, moduloTabla] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable = moduloTabla.default;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 40;
  const alcance = alcanceDe(periodo);

  doc.setFillColor(COLORES.verdeOscuro);
  doc.rect(0, 0, ancho, 76, "F");

  doc.setTextColor(COLORES.blanco || "#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Análisis de Ingresos", margen, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Panel Avrill${separador}${alcance}`, margen, 51);
  doc.text(`Generado ${marcaDeTiempo()}`, margen, 64);

  const tarjetas = [
    ["Total", formatearMoneda(analisis.total)],
    ["Pedidos", String(analisis.cantidadPedidos)],
    ["Ticket prom.", formatearMoneda(analisis.ticketPromedio)],
    ["Mejor periodo", analisis.mejor ? analisis.mejor.etiqueta : "—"],
  ];

  const anchoTarjeta = (ancho - margen * 2 - 24) / 4;
  let y = 96;

  tarjetas.forEach(([etiqueta, valor], indice) => {
    const x = margen + indice * (anchoTarjeta + 8);

    doc.setFillColor(COLORES.crema);
    doc.setDrawColor(COLORES.borde);
    doc.roundedRect(x, y, anchoTarjeta, 52, 6, 6, "FD");

    doc.setTextColor(COLORES.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(etiqueta.toUpperCase(), x + 10, y + 17);

    doc.setTextColor(COLORES.verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(String(valor), x + 10, y + 37);
  });

  y += 70;

  doc.setTextColor(COLORES.texto);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Ingresos por periodo", margen, y);
  y += 8;

  const lienzo = dibujarGrafico(analisis.filas);
  const imagenAncho = ancho - margen * 2;
  const imagenAlto = (lienzo.height / lienzo.width) * imagenAncho;

  doc.addImage(
    lienzo.toDataURL("image/png"),
    "PNG",
    margen,
    y,
    imagenAncho,
    imagenAlto
  );

  y += imagenAlto + 22;

  const estiloTabla = {
    font: "helvetica",
    fontSize: 9,
    cellPadding: 6,
    lineColor: COLORES.borde,
    lineWidth: 0.5,
    textColor: COLORES.texto,
  };

  const estiloEncabezadoTabla = {
    fillColor: COLORES.verdeOscuro,
    textColor: blancoPdf,
    fontStyle: "bold",
  };

  const asegurarEspacio = (necesario) => {
    if (y + necesario > alto - 70) {
      doc.addPage();
      y = 60;
    }
  };

  asegurarEspacio(120);

  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [["Periodo", "Pedidos", "Ingresos", "% del total"]],
    body: analisis.filas.map((fila) => [
      fila.etiqueta,
      String(fila.pedidos),
      formatearMoneda(fila.monto),
      formatearPorcentaje(fila.porcentaje),
    ]),
    foot: [
      [
        "TOTAL",
        String(analisis.cantidadPedidos),
        formatearMoneda(analisis.total),
        "100.0 %",
      ],
    ],
    styles: estiloTabla,
    headStyles: estiloEncabezadoTabla,
    footStyles: {
      fillColor: COLORES.arena,
      textColor: COLORES.verdeOscuro,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: COLORES.crema },
    columnStyles: {
      1: { halign: "center", cellWidth: 60 },
      2: { halign: "right" },
      3: { halign: "right", cellWidth: 62 },
    },
  });

  y = (doc.lastAutoTable?.finalY || y) + 26;

  if (desglose.length > 0) {
    asegurarEspacio(140);

    doc.setTextColor(COLORES.texto);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Ingresos por estado del pedido", margen, y);

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margen, right: margen },
      head: [["Estado", "Pedidos", "Monto"]],
      body: desglose.map((item) => [
        item.estado,
        String(item.pedidos),
        formatearMoneda(item.monto),
      ]),
      styles: estiloTabla,
      headStyles: estiloEncabezadoTabla,
      alternateRowStyles: { fillColor: COLORES.crema },
      columnStyles: {
        1: { halign: "center", cellWidth: 60 },
        2: { halign: "right" },
      },
    });

    y = (doc.lastAutoTable?.finalY || y) + 26;
  }

  const todos = pedidosOrdenados(pedidos);
  const lista = todos.slice(0, 100);

  if (lista.length > 0) {
    asegurarEspacio(150);

    doc.setTextColor(COLORES.texto);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `Detalle de pedidos${
        todos.length > 100 ? ` (primeros 100 de ${todos.length})` : ""
      }`,
      margen,
      y
    );

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margen, right: margen },
      head: [["Fecha", "Pedido", "Cliente", "Estado", "Artículos", "Total"]],
      body: lista.map((pedido) => [
        fechaCorta(pedido.fecha),
        String(pedido.id ?? "—"),
        clienteDe(pedido),
        pedido.estado || "pendiente",
        String(articulosDe(pedido)),
        formatearMoneda(pedido.total),
      ]),
      styles: { ...estiloTabla, fontSize: 8, cellPadding: 5 },
      headStyles: estiloEncabezadoTabla,
      alternateRowStyles: { fillColor: COLORES.crema },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        3: { cellWidth: 64 },
        4: { halign: "center", cellWidth: 46 },
        5: { halign: "right", cellWidth: 70 },
      },
    });
  }

  const paginas = doc.internal.getNumberOfPages();

  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORES.muted);
    doc.text(
      `Panel Avrill${separador}${alcance}${separador}Página ${i} de ${paginas}`,
      margen,
      alto - 20
    );
  }

  doc.save(nombreArchivo(periodo, "pdf"));

  return { paginas, pedidos: lista.length, total: todos.length };
}
