// descripcion: menu lateral reutilizable para la vista de usuario y el dashboard administrativo.
export default function Sidebar({ titulo, opciones, activa, onCambiar }) {
  return (
    <aside className="sidebar">
      <h2>{titulo}</h2>
      <div className="opciones-sidebar">
        {opciones.map((opcion) => (
          <button
            className={activa === opcion.id ? 'opcion-activa' : ''}
            key={opcion.id}
            onClick={() => onCambiar(opcion.id)}
            type="button"
          >
            <span>{opcion.icono}</span>
            {opcion.nombre}
          </button>
        ))}
      </div>
    </aside>
  )
}
