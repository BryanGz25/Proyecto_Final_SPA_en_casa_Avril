
import { useState } from "react";

export default function EditorProducto({
  producto,
  onGuardar,
  onEliminar,
}) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [categoria, setCategoria] = useState(producto.categoria);
  const [disponible, setDisponible] = useState(
    producto.disponible
  );

  const guardar = (event) => {
    event.preventDefault();

    onGuardar(producto.id, {
      nombre,
      precio: Number(precio),
      categoria,
      disponible,
    });
  };

  return (
    <form className="editor-producto" onSubmit={guardar}>
      <h3>{producto.nombre}</h3>

      <label>Nombre</label>
      <input
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
      />

      <label>Precio</label>
      <input
        type="number"
        min="0"
        value={precio}
        onChange={(event) => setPrecio(event.target.value)}
      />

      <label>Categoría</label>
      <select
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
      >
        <option value="jabones">Jabones</option>
        <option value="sales">Sales</option>
        <option value="splash">Splash</option>
        <option value="decorativos">Decorativos</option>
      </select>

      <label className="check-linea">
        <input
          type="checkbox"
          checked={disponible}
          onChange={(event) =>
            setDisponible(event.target.checked)
          }
        />
        Producto disponible
      </label>

      <div className="producto-acciones">
        <button className="btn-principal">Guardar</button>

        <button
          type="button"
          className="btn-peligro"
          onClick={() => onEliminar(producto.id)}
        >
          Eliminar
        </button>
      </div>
    </form>
  );
}