import { EMISOR } from "../config";

export const formatoCRC = (valor) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(valor);

const redondear = (numero) => Math.round(numero * 100) / 100;

export function calcularTotalesFactura(lineas = []) {
  const subtotal = lineas.reduce(
    (suma, linea) => suma + (Number(linea.precio || 0) * Number(linea.cantidad || 1)),
    0
  );

  const iva = redondear(subtotal * 0.13);
  const total = redondear(subtotal + iva);

  return { subtotal, iva, total };
}

export function construirFactura(pedido) {
  const lineas = (pedido.productos || []).map((producto) => {
    const cantidad = producto.cantidad || 1;
    const monto = redondear(producto.precio * cantidad);

    return {
      codigo: String(producto.id),
      descripcion: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      monto,
    };
  });

  const total = redondear(
    lineas.reduce((suma, linea) => suma + linea.monto, 0)
  );

  const porcentajeIva = Number(EMISOR.porcentajeIva) || 13;
  const iva = redondear(
    (total * porcentajeIva) / (100 + porcentajeIva)
  );
  const subtotal = redondear(total - iva);

  const fecha = pedido.fecha
    ? new Date(pedido.fecha)
    : new Date();

  const numero =
    pedido.numero ||
    pedido.factura?.numero ||
    `PF-${fecha.getFullYear()}-${String(pedido.id).padStart(5, "0")}`;

  return {
    numero,
    moneda: EMISOR.moneda,
    condicionVenta: EMISOR.condicionVenta,
    medioPago: EMISOR.medioPago,
    plazoCredito: EMISOR.plazoCredito,
    porcentajeIva,
    fechaEmision: pedido.fecha || new Date().toISOString(),
    emisor: EMISOR,
    receptor: {
      nombre: pedido.cliente?.nombre || "Cliente",
      identificacion:
        pedido.cliente?.identificacion || "Sin especificar",
      correo: pedido.cliente?.correo || "",
      telefono: pedido.cliente?.telefono || "",
      direccion: pedido.cliente?.direccion || "",
      coordenadas: pedido.cliente?.coordenadas || null,
    },
    lineas,
    subtotal,
    iva,
    total,
  };
}

const formatoFecha = (factura) =>
  new Date(factura.fechaEmision).toLocaleString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const escaparHtml = (valor) =>
  String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caracter]);

const sanearValoresHtml = (valor) => {
  if (typeof valor === "string") return escaparHtml(valor);
  if (Array.isArray(valor)) return valor.map(sanearValoresHtml);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, contenido]) => [clave, sanearValoresHtml(contenido)])
    );
  }
  return valor;
};

export function facturaHtml(factura) {
  factura = sanearValoresHtml(factura);

  const filas = factura.lineas
    .map(
      (linea) => `
        <tr>
          <td>${linea.codigo}</td>
          <td>${linea.descripcion}</td>
          <td class="ta-c">${linea.cantidad}</td>
          <td class="ta-r">${formatoCRC(linea.precioUnitario)}</td>
          <td class="ta-r">${formatoCRC(linea.monto)}</td>
        </tr>`
    )
    .join("");

  const coordenadas = factura.receptor.coordenadas
    ? `<p class="linea-pequena">Ubicaci├│n GPS: ${factura.receptor.coordenadas.lat}, ${factura.receptor.coordenadas.lng}</p>`
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Factura Proforma ${factura.numero}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        color: #191c1a;
        font-family: "Arial", "Helvetica", sans-serif;
        font-size: 13px;
        line-height: 1.5;
        margin: 0 auto;
        max-width: 800px;
        padding: 32px 24px;
      }
      h1 { font-size: 22px; margin: 0; }
      h2 { font-size: 14px; margin: 0 0 8px; border-bottom: 2px solid #4a5d4e; padding-bottom: 6px; }
      .encabezado {
        align-items: flex-start;
        border-bottom: 3px solid #4a5d4e;
        display: flex;
        justify-content: space-between;
        padding-bottom: 16px;
      }
      .marca { color: #334537; }
      .marca small { color: #6e7570; }
      .numeros { text-align: right; }
      .numeros p { margin: 2px 0; }
      .fecha { color: #6e7570; }
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
        margin-top: 16px;
      }
      .panel { border: 1px solid #e8e2d8; border-radius: 8px; padding: 12px 14px; }
      .panel p { margin: 3px 0; }
      .linea-pequena { color: #6e7570; font-size: 12px; }
      table { border-collapse: collapse; margin-top: 16px; width: 100%; }
      th {
        background: #4a5d4e;
        color: #ffffff;
        font-size: 12px;
        padding: 8px;
        text-align: left;
        text-transform: uppercase;
      }
      td { border-bottom: 1px solid #e8e2d8; padding: 8px; }
      .ta-r { text-align: right; }
      .ta-c { text-align: center; }
      .montos { margin-left: auto; margin-top: 12px; width: 320px; }
      .montos p { display: flex; justify-content: space-between; margin: 4px 0; }
      .montos .total {
        border-top: 2px solid #4a5d4e;
        font-size: 15px;
        font-weight: 700;
        padding-top: 8px;
      }
      .nota {
        background: #faf6f0;
        border-left: 4px solid #a96447;
        color: #6e7570;
        font-size: 11px;
        margin-top: 20px;
        padding: 10px 12px;
      }
      .pie { color: #6e7570; font-size: 11px; margin-top: 24px; text-align: center; }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="encabezado">
      <div class="marca">
        <h1>${factura.emisor.nombreComercial}</h1>
        <small>Factura proforma ┬À No es un comprobante electr├│nico</small>
      </div>
      <div class="numeros">
        <p><strong>Factura Proforma ${factura.numero}</strong></p>
        <p class="fecha">${formatoFecha(factura)}</p>
      </div>
    </div>

    <div class="grid">
      <div class="panel">
        <h2>Emisor</h2>
        <p><strong>${factura.emisor.nombre}</strong></p>
        <p>C├®dula: ${factura.emisor.cedula}</p>
        <p>Nombre comercial: ${factura.emisor.nombreComercial}</p>
        <p>Tel├®fono: ${factura.emisor.telefono}</p>
        <p>Correo: ${factura.emisor.correo}</p>
        <p>Direcci├│n: ${factura.emisor.direccion}</p>
        <p class="linea-pequena">C├│digo de actividad econ├│mica: ${factura.emisor.actividad}</p>
      </div>
      <div class="panel">
        <h2>Receptor</h2>
        <p><strong>${factura.receptor.nombre}</strong></p>
        <p>Identificaci├│n: ${factura.receptor.identificacion}</p>
        <p>Correo: ${factura.receptor.correo}</p>
        <p>Tel├®fono: ${factura.receptor.telefono}</p>
        <p>Direcci├│n: ${factura.receptor.direccion}</p>
        ${coordenadas}
      </div>
    </div>

    <div class="grid">
      <div class="panel">
        <h2>Condiciones</h2>
        <p>Condici├│n de venta: ${factura.condicionVenta}</p>
        <p>Medio de pago: ${factura.medioPago}</p>
        <p>Plazo de cr├®dito: ${factura.plazoCredito}</p>
      </div>
      <div class="panel">
        <h2>Moneda</h2>
        <p>Col├│n costarricense (CRC)</p>
        <p>Impuesto incluido: IVA ${factura.porcentajeIva}%</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>C├│digo</th>
          <th>Descripci├│n</th>
          <th class="ta-c">Cant.</th>
          <th class="ta-r">Precio unit.</th>
          <th class="ta-r">Monto</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>

    <div class="montos">
      <p><span>Subtotal (sin impuestos)</span><strong>${formatoCRC(factura.subtotal)}</strong></p>
      <p><span>IVA ${factura.porcentajeIva}%</span><strong>${formatoCRC(factura.iva)}</strong></p>
      <p class="total"><span>Total</span><strong>${formatoCRC(factura.total)}</strong></p>
    </div>

    <div class="nota">
      Documento sin validez fiscal ante el Ministerio de Hacienda de Costa Rica.
      Corresponde a un presupuesto o factura proforma sujeto a modificaci├│n hasta la
      confirmaci├│n del pedido. Los precios incluyen el IVA (${factura.porcentajeIva}%) de acuerdo
      con la legislaci├│n tributaria vigente.
    </div>

    <p class="pie">${factura.emisor.nombreComercial} ┬À ${factura.emisor.direccion} ┬À ${factura.emisor.telefono}</p>
  </body>
</html>`;
}

export function descargarFactura(factura) {
  const oculto = document.createElement("a");
  const blob = new Blob([facturaHtml(factura)], {
    type: "text/html;charset=utf-8",
  });

  oculto.href = URL.createObjectURL(blob);
  oculto.download = `Factura-Proforma-${factura.numero}.html`;
  document.body.appendChild(oculto);
  oculto.click();
  oculto.remove();
  URL.revokeObjectURL(oculto.href);
}
