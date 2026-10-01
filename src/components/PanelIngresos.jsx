import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calcularIngresos,
  desglosePorEstado,
  PERIODOS,
} from "../utils/ingresos";
import {
  exportarIngresosExcel,
  exportarIngresosPdf,
  formatearMoneda,
  formatearPorcentaje,
} from "../utils/exportarIngresos";

const COLOR_BARRA = "#4a5d4e";
const COLOR_BARRA_VACIA = "#d8d2c6";

const TooltipPersonalizado = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const fila = payload[0].payload;

  return (
    <div className="grafico-tooltip">
      <strong>{label}</strong>
      <span>{formatearMoneda(fila.monto)}</span>
      <span className="grafico-tooltip-pedidos">
        {fila.pedidos} {fila.pedidos === 1 ? "pedido" : "pedidos"}
      </span>
    </div>
  );
};

export default function PanelIngresos({ pedidos, periodo, onCambiarPeriodo }) {
  const [exportando, setExportando] = useState(null);
  const [error, setError] = useState("");

  const analisis = useMemo(
    () => calcularIngresos(pedidos, periodo),
    [pedidos, periodo]
  );

  const estados = useMemo(() => desglosePorEstado(pedidos), [pedidos]);

  const datosGrafico = analisis.filas.map((fila) => ({
    etiqueta: fila.etiqueta,
    monto: fila.monto,
    pedidos: fila.pedidos,
    porcentaje: fila.porcentaje,
  }));

  const meta = PERIODOS[periodo] || PERIODOS.mes;
  const hayDatos = analisis.total > 0;

  const exportar = async (formato) => {
    setExportando(formato);
    setError("");

    try {
      const argumentos = { analisis, pedidos, periodo, desglose: estados };

      if (formato === "excel") {
        await exportarIngresosExcel(argumentos);
      } else {
        await exportarIngresosPdf(argumentos);
      }
    } catch (fallo) {
      setError(
        `No se pudo generar el archivo ${
          formato === "excel" ? "de Excel" : "PDF"
        }. ${fallo?.message || "Intenta de nuevo."}`
      );
    } finally {
      setExportando(null);
    }
  };

  return (
    <section className="ingresos-panel">
      <div className="dashboard-titulo">
        <div>
          <h2>Ingresos</h2>
          <p className="ingresos-subtitulo">
            {meta.etiqueta} · {meta.alcance}
          </p>
        </div>

        <div className="ingresos-controles">
          <label className="selector-periodo" htmlFor="periodo-ingresos">
            <span>Periodo</span>
            <select
              id="periodo-ingresos"
              value={periodo}
              onChange={(e) => onCambiarPeriodo(e.target.value)}
            >
              {Object.entries(PERIODOS).map(([clave, valor]) => (
                <option key={clave} value={clave}>
                  {valor.etiqueta} ({valor.alcance})
                </option>
              ))}
            </select>
          </label>

          <div className="ingresos-descargas">
            <button
              type="button"
              className="btn-secundario"
              onClick={() => exportar("excel")}
              disabled={exportando !== null || !hayDatos}
            >
              {exportando === "excel" ? "Generando…" : "Excel"}
            </button>

            <button
              type="button"
              className="btn-secundario"
              onClick={() => exportar("pdf")}
              disabled={exportando !== null || !hayDatos}
            >
              {exportando === "pdf" ? "Generando…" : "PDF"}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <div className="ingresos-kpis">
        <article>
          <span className="ingresos-kpi-etiqueta">Ingresos del periodo</span>
          <strong>{formatearMoneda(analisis.total)}</strong>
        </article>

        <article>
          <span className="ingresos-kpi-etiqueta">Pedidos contados</span>
          <strong>{analisis.cantidadPedidos}</strong>
        </article>

        <article>
          <span className="ingresos-kpi-etiqueta">Ticket promedio</span>
          <strong>{formatearMoneda(analisis.ticketPromedio)}</strong>
        </article>

        <article>
          <span className="ingresos-kpi-etiqueta">Mejor periodo</span>
          <strong>
            {analisis.mejor
              ? `${analisis.mejor.etiqueta} · ${formatearMoneda(
                  analisis.mejor.monto
                )}`
              : "—"}
          </strong>
        </article>
      </div>

      <div className="panel-grafico-contenedor">
        {hayDatos ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={datosGrafico}
              margin={{ top: 12, right: 12, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} />

              <YAxis
                tickFormatter={(valor) =>
                  valor >= 1000 ? `${Math.round(valor / 1000)}k` : valor
                }
                tickLine={false}
                axisLine={false}
                width={56}
              />

              <Tooltip
                content={<TooltipPersonalizado />}
                cursor={{ fill: "rgba(74, 93, 78, 0.08)" }}
              />

              <Bar dataKey="monto" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {datosGrafico.map((fila) => (
                  <Cell
                    key={fila.etiqueta}
                    fill={
                      fila.monto > 0 ? COLOR_BARRA : COLOR_BARRA_VACIA
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="ingresos-vacio">
            Sin ingresos registrados en este periodo.
          </p>
        )}
      </div>

      <div className="ingresos-tabla-contenedor">
        <table className="ingresos-tabla">
          <thead>
            <tr>
              <th scope="col">Periodo</th>
              <th scope="col">Pedidos</th>
              <th scope="col">Ingresos</th>
              <th scope="col">% del total</th>
            </tr>
          </thead>
          <tbody>
            {analisis.filas.map((fila) => (
              <tr key={fila.clave} className={fila.monto > 0 ? "" : "fila-vacia"}>
                <td>{fila.etiqueta}</td>
                <td>{fila.pedidos}</td>
                <td>{formatearMoneda(fila.monto)}</td>
                <td>{formatearPorcentaje(fila.porcentaje)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td>{analisis.cantidadPedidos}</td>
              <td>{formatearMoneda(analisis.total)}</td>
              <td>100.0 %</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {estados.length > 0 && (
        <details className="ingresos-desglose">
          <summary>Desglose por estado ({estados.length})</summary>

          <ul>
            {estados.map((item) => (
              <li key={item.estado}>
                <span>{item.estado}</span>
                <span>
                  {item.pedidos}{" "}
                  {item.pedidos === 1 ? "pedido" : "pedidos"}
                </span>
                <strong>{formatearMoneda(item.monto)}</strong>
              </li>
            ))}
          </ul>
        </details>
      )}

      <small className="ingresos-nota">
        Los ingresos se calculan desde los pedidos reales del tienda. Se
        excluyen los pedidos cancelados y los que no tienen fecha válida. Los
        estados pendientes sí se acumulan; consulta el desglose para ver el
        detalle.
      </small>
    </section>
  );
}
