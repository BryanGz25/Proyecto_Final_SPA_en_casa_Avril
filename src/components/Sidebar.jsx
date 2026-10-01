import React from "react";
import { 
  FiPackage, 
  FiClipboard, 
  FiUsers, 
  FiBarChart2, 
  FiMessageSquare 
} from "react-icons/fi";

export default function Sidebar({ titulo, opciones, activa, onCambiar }) {
  const obtenerIcono = (id) => {
    switch (id) {
      case "inventario":
        return <FiPackage size={18} />;
      case "pedidos":
        return <FiClipboard size={18} />;
      case "clientes":
        return <FiUsers size={18} />;
      case "ingresos":
        return <FiBarChart2 size={18} />;
      case "solicitudes":
        return <FiMessageSquare size={18} />;
      default:
        return <FiPackage size={18} />;
    }
  };

  return (
    <aside className="sidebar">
      <h2>{titulo}</h2>
      <div className="opciones-sidebar">
        {opciones.map((opcion) => (
          <button
            type="button"
            className={activa === opcion.id ? "opcion-activa" : ""}
            key={opcion.id}
            onClick={() => onCambiar(opcion.id)}
          >
            <span className="sidebar-icono">
              {obtenerIcono(opcion.id)}
            </span>
            <span className="sidebar-nombre">{opcion.nombre}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}