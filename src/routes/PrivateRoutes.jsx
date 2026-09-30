import { useEffect, useState } from "react";
import { useAppContext } from "./Routing"; // Importa el contexto desde la misma carpeta
import { apiSesion } from "../services/api";

export default function PrivateRoutes({ children, soloAdmin = false }) {
  const { usuarioActivo, token, cerrarSesion, navigate } = useAppContext();
  const [validando, setValidando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const verificarAcceso = async () => {
      if (!token || !usuarioActivo?.id) {
        if (!cancelado) {
          setPermitido(false);
          setValidando(false);
          cerrarSesion();
          navigate("/login");
        }
        return;
      }

      if (soloAdmin && usuarioActivo.rol !== "admin") {
        if (!cancelado) {
          setPermitido(false);
          setValidando(false);
          navigate("/");
        }
        return;
      }

      try {
        const sesionValida = await apiSesion.validar(usuarioActivo.id, token);
        if (!cancelado) {
          if (sesionValida) {
            setPermitido(true);
          } else {
            setPermitido(false);
            cerrarSesion();
            navigate("/login");
          }
        }
      } catch {
        if (!cancelado) {
          setPermitido(false);
          cerrarSesion();
          navigate("/login");
        }
      } finally {
        if (!cancelado) {
          setValidando(false);
        }
      }
    };

    verificarAcceso();

    return () => {
      cancelado = true;
    };
  }, []);

  if (validando) {
    return (
      <main className="pagina paginas-cargando">
        <p>Validando sesión, espera un momento...</p>
      </main>
    );
  }

  return permitido ? <>{children}</> : null;
}