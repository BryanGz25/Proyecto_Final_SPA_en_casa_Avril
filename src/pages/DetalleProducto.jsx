
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";

export default function DetalleProducto() {
  const {
    rutaActual,
    productos,
    agregarAlCarrito,
    navigate,
  } = useAppContext();

  const id = Number(rutaActual.split("/").pop());

  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    return (
      <>
        <Encabezado />
        <main className="pagina">
          <h1>Producto no encontrado</h1>
          <button
            className="btn-principal"
            onClick={() => navigate("/catalogo")}
          >
            Volver al catálogo
          </button>
        </main>
      </>
    );
  }

  const precio = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(producto.precio);

  return (
    <>
      <Encabezado />

      <main className="pagina">
        <section className="detalle-producto">
          <img
            src={producto.imagen}
            alt={producto.nombre}
          />

          <div className="detalle-contenido">
            <span className="eyebrow">{producto.etiqueta}</span>
            <h1>{producto.nombre}</h1>
            <p>{producto.detalle}</p>

            <strong className="detalle-precio">
              {precio}
            </strong>

            <p>
              Categoría: <strong>{producto.categoria}</strong>
            </p>

            <p>
              Estado:{" "}
              {producto.disponible
                ? "Disponible"
                : "Agotado"}
            </p>

            <div className="producto-acciones">
              <button
                className="btn-principal"
                disabled={!producto.disponible}
                onClick={() => agregarAlCarrito(producto)}
              >
                Agregar al carrito
              </button>

              <button
                className="btn-secundario"
                onClick={() => navigate("/catalogo")}
              >
                Volver al catálogo
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
