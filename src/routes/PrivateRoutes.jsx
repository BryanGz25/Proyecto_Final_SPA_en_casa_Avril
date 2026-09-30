import { useEffect, useEffectEvent, useState } from "react";
import { useAppContext } from "./Routing"; // Importa el contexto desde la misma carpeta
import { apiSesion } from "../services/api";

export default function PrivateRoutes({ children, soloAdmin = false }) {
  const { usuarioActivo, cerrarSesion, navigate, rutaActual } = useAppContext();
  const [validando, setValidando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  const verificarAcceso = useEffectEvent(async (estaCancelado) => {
    try {
      const sesion = await apiSesion.validar();
      if (estaCancelado()) return;

      const usuarioVerificado = sesion?.usuario;
      if (!usuarioVerificado || String(usuarioVerificado.id) !== String(usuarioActivo?.id)) {
        setPermitido(false);
        cerrarSesion();
        navigate("/login");
      } else if (soloAdmin && usuarioVerificado.rol !== "admin") {
        setPermitido(false);
        navigate("/");
      } else {
        setPermitido(true);
      }
    } catch {
      if (!estaCancelado()) {
        setPermitido(false);
        navigate("/login");
      }
    } finally {
      if (!estaCancelado()) setValidando(false);
    }
  });

  useEffect(() => {
    let cancelado = false;
    queueMicrotask(() => {
      if (!cancelado) verificarAcceso(() => cancelado);
    });
    return () => {
      cancelado = true;
    };
  }, [rutaActual, usuarioActivo?.id, soloAdmin]);

  if (validando) {
    return (
      <main className="pagina paginas-cargando">
        <p>Validando sesión, espera un momento...</p>
      </main>
    );
  }

  return permitido ? <>{children}</> : null;
}