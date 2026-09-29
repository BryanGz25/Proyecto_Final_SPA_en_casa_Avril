
import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import { categorias } from "../data/productos";
import TarjetaProducto from "../components/TarjetaProducto";
import Encabezado from "../components/Encabezado";

export default function Catalogo() {
  const { productos } = useAppContext();
  const [categoriaActiva, setCategoriaActiva] = useState("todos");

  const productosFiltrados =
    categoriaActiva === "todos"
      ? productos
      : productos.filter(
          (producto) => producto.categoria === categoriaActiva
        );

  return (
    <>
      <Encabezado />

      <main className="pagina">
        <section className="seccion-introduccion">
          <span className="eyebrow">Colección Avrill</span>
          <h1>Catálogo artesanal</h1>
          <p>
            Descubre productos creados para acompañar tus
            momentos de bienestar.
          </p>
        </section>

        <div className="filtros">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              className={
                categoriaActiva === categoria
                  ? "filtro activo"
                  : "filtro"
              }
              onClick={() => setCategoriaActiva(categoria)}
            >
              {categoria.charAt(0).toUpperCase() +
                categoria.slice(1)}
            </button>
          ))}
        </div>

        <section className="productos-grid">
          {productosFiltrados.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
            />
          ))}
        </section>
      </main>
    </>
  );
}
