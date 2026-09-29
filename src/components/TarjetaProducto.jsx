import { useAppContext } from "../routes/Routing";

const etiquetasCategoria = {
  jabones: "Jabones de Glicerina",
  sales: "Sales de Baño",
  splash: "Body Splash",
  decorativos: "Jabones Temáticos",
};

export default function TarjetaProducto({ producto }) {
  const { agregarAlCarrito, navigate } = useAppContext();

  const precio = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(producto.precio);

  const categoria =
    etiquetasCategoria[producto.categoria] || producto.categoria;

  return (
    <article className="producto-card">
      <div className="producto-foto">
        {producto.etiqueta && (
          <span className="producto-chips">{producto.etiqueta}</span>
        )}
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
        />
      </div>

      <div className="producto-contenido">
        <span className="producto-sub">{categoria}</span>

        <h3>{producto.nombre}</h3>
        <p>{producto.detalle}</p>

        <div className="producto-pie">
          <span
            className={
              producto.disponible
                ? "estado disponible"
                : "estado agotado"
            }
          >
            {producto.disponible ? "Disponible" : "Agotado"}
          </span>
          <strong className="producto-precio">{precio}</strong>
        </div>

        <div className="card-acciones">
          <button
            className="btn-detalle"
            onClick={() => navigate(`/producto/${producto.id}`)}
          >
            Ver detalle
          </button>

          <button
            className="btn-agregar"
            disabled={!producto.disponible}
            onClick={() => agregarAlCarrito(producto)}
            title="Agregar al carrito"
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}