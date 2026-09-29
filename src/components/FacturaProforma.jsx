import { useState } from "react";
import {
  construirFactura,
  descargarFactura,
  facturaHtml,
  formatoCRC,
} from "../utils/factura";
import { enviarFacturaPorCorreo } from "../services/correo";

export default function FacturaProforma({ pedido, onCerrar }) {
  const factura = construirFactura(pedido);

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const fechaResultado = new Date(factura.fechaEmision).toLocaleString(
    "es-CR"
  );

  const imprimirFactura = () => {
    const marco = document.createElement("iframe");

    marco.setAttribute("aria-hidden", "true");
    marco.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";

    document.body.appendChild(marco);

    const documento = marco.contentWindow.document;

    documento.open();
    documento.write(facturaHtml(factura));
    documento.close();

    marco.contentWindow.addEventListener(
      "afterprint",
      () => marco.remove()
    );

    marco.contentWindow.focus();
    marco.contentWindow.print();

    window.setTimeout(() => marco.remove(), 2000);
  };

  const enviarCorreo = async () => {
    setEnviando(true);
    setMensaje("");

    try {
      const resultado = await enviarFacturaPorCorreo(pedido);

      setMensaje(`Factura enviada a ${resultado.destinatario}.`);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="factura-overlay" role="dialog" aria-modal="true">
      <div className="factura-modal">
        <div className="dashboard-titulo factura-titulo">
          <div>
            <span className="eyebrow">Avrill</span>
            <h2>Factura Proforma {factura.numero}</h2>
            <p className="factura-fecha">{fechaResultado}</p>
          </div>

          <div className="factura-acciones">
            <button
              className="btn-secundario"
              onClick={imprimirFactura}
            >
              Imprimir / PDF
            </button>

            <button
              className="btn-secundario"
              onClick={() => descargarFactura(factura)}
            >
              Descargar
            </button>

            <button
              className="btn-principal"
              onClick={enviarCorreo}
              disabled={enviando}
            >
              {enviando ? "Enviando…" : "Enviar por correo"}
            </button>

            <button
              className="btn-texto"
              onClick={onCerrar}
              aria-label="Cerrar factura"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="factura-cuerpo">
          <div className="factura-grid">
            <div className="factura-panel">
              <h3>Emisor</h3>
              <p>
                <strong>{factura.emisor.nombreComercial}</strong>
              </p>
              <p>Cédula: {factura.emisor.cedula}</p>
              <p>Teléfono: {factura.emisor.telefono}</p>
              <p>Correo: {factura.emisor.correo}</p>
              <p>Dirección: {factura.emisor.direccion}</p>
              <small>
                Actividad económica: {factura.emisor.actividad}
              </small>
            </div>

            <div className="factura-panel">
              <h3>Receptor</h3>
              <p>
                <strong>{factura.receptor.nombre}</strong>
              </p>
              <p>Identificación: {factura.receptor.identificacion}</p>
              <p>Correo: {factura.receptor.correo}</p>
              <p>Teléfono: {factura.receptor.telefono}</p>
              <p>Dirección: {factura.receptor.direccion}</p>
              {factura.receptor.coordenadas && (
                <small>
                  GPS: {factura.receptor.coordenadas.lat},{" "}
                  {factura.receptor.coordenadas.lng}
                </small>
              )}
            </div>
          </div>

          <div className="factura-grid factura-condiciones">
            <div className="factura-panel">
              <h3>Condiciones</h3>
              <p>
                Venta: {factura.condicionVenta} · Pago:{" "}
                {factura.medioPago} · Plazo: {factura.plazoCredito}
              </p>
            </div>
            <div className="factura-panel">
              <h3>Moneda e impuesto</h3>
              <p>
                {factura.moneda} · IVA {factura.porcentajeIva}%
                incluido
              </p>
            </div>
          </div>

          <table className="factura-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cant.</th>
                <th>Precio unit.</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {factura.lineas.map((linea) => (
                <tr key={`${linea.codigo}-${linea.descripcion}`}>
                  <td>{linea.codigo}</td>
                  <td>{linea.descripcion}</td>
                  <td>{linea.cantidad}</td>
                  <td>{formatoCRC(linea.precioUnitario)}</td>
                  <td>{formatoCRC(linea.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="factura-montos">
            <p>
              <span>Subtotal (sin impuestos)</span>
              <strong>{formatoCRC(factura.subtotal)}</strong>
            </p>
            <p>
              <span>IVA {factura.porcentajeIva}%</span>
              <strong>{formatoCRC(factura.iva)}</strong>
            </p>
            <p className="factura-total">
              <span>Total</span>
              <strong>{formatoCRC(factura.total)}</strong>
            </p>
          </div>

          <div className="factura-nota">
            Documento sin validez fiscal ante el Ministerio de Hacienda
            de Costa Rica. Corresponde a una factura proforma sujeta a
            cambio hasta la confirmación del pedido. Precios con IVA (
            {factura.porcentajeIva}%) incluido.
          </div>

          {mensaje && (
            <p className="factura-mensaje">{mensaje}</p>
          )}
        </div>
      </div>
    </div>
  );
}