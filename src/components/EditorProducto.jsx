import { useState } from "react";

export default function EditorProducto({ producto, onGuardar, onEliminar }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(producto.precio);
  const [categoria, setCategoria] = useState(producto.categoria);
  const [disponible, setDisponible] = useState(producto.disponible);

  const habilitarEdicion = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditando(true);
  };

  const cancelarEdicion = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setCategoria(producto.categoria);
    setDisponible(producto.disponible);
    setEditando(false);
  };

  const guardar = (event) => {
    event.preventDefault();
    onGuardar(producto.id, {
      nombre,
      precio: Number(precio),
      categoria,
      disponible,
    });
    setEditando(false);
  };

  return (
    <form className="editor-producto position-relative" onSubmit={guardar}>
      {/* Botón X posicionado en la esquina superior izquierda para cancelar la edición */}
      {editando && (
        <button
          type="button"
          className="btn-cerrar-edicion"
          onClick={cancelarEdicion}
          title="Cancelar edición"
          aria-label="Cancelar edición"
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#68746d",
            zIndex: 10,
            lineHeight: 1,
            padding: "2px 6px",
          }}
        >
          ✕
        </button>
      )}

      <h3>{producto.nombre}</h3>

      <label>Nombre</label>
      <input
        type="text"
        value={nombre}
        disabled={!editando}
        onChange={(event) => setNombre(event.target.value)}
      />

      <label>Precio</label>
      <input
        type="number"
        min="0"
        value={precio}
        disabled={!editando}
        onChange={(event) => setPrecio(event.target.value)}
      />

      <label>Categoría</label>
      <select
        value={categoria}
        disabled={!editando}
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
          disabled={!editando}
          onChange={(event) => setDisponible(event.target.checked)}
        />
        Producto disponible
      </label>

      <div className="producto-acciones" style={{ marginTop: "15px" }}>
        {!editando ? (
          <button
            type="button"
            className="btn-principal"
            onClick={habilitarEdicion}
          >
            Editar
          </button>
        ) : (
          <>
            <button type="submit" className="btn-principal">
              Guardar
            </button>
            <button
              type="button"
              className="btn-peligro"
              onClick={() => onEliminar(producto.id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </form>
  );
}