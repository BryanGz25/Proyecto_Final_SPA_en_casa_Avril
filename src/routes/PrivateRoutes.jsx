import { useEffect, useRef, useState } from "react";
import { useAppContext } from "./Routing";
import { apiSesion } from "../services/api";
import {
  NOMBRE_COOKIE_TOKEN,
  NOMBRE_COOKIE_USUARIO,
  leerCookie,
} from "../services/cookies";

const TIEMPO_INACTIVIDAD = 2 * 60 * 1000;

const EVENTOS_ACTIVIDAD = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "click",
  "touchstart",
];

export default function PrivateRoutes({
  children,
  soloAdmin = false,
}) {
  const {
    rutaActual,
    usuarioActivo,
    restaurarSesion,
    cerrarSesion,
  } = useAppContext();

  const [permitido, setPermitido] = useState(false);
  const [validando, setValidando] = useState(true);
  const temporizador = useRef(null);
  const idUsuario = usuarioActivo?.id;
  const cerrarSesionRef = useRef(cerrarSesion);

  useEffect(() => {
    cerrarSesionRef.current = cerrarSesion;
  }, [cerrarSesion]);

  useEffect(() => {
    let activo = true;

    const validarSesion = async () => {
      try {
        const token = leerCookie(NOMBRE_COOKIE_TOKEN);
        const idSesion = leerCookie(NOMBRE_COOKIE_USUARIO);

        if (!token || !idSesion || !idUsuario) {
          cerrarSesion();
          return;
        }

        const usuarioValidado = await apiSesion.validar(token, idSesion);

        if (!usuarioValidado) {
          cerrarSesion();
          return;
        }

        if (soloAdmin && usuarioValidado.rol !== "admin") {
          cerrarSesion();
          return;
        }

        if (!activo) return;

        const usuarioLimpio = { ...usuarioValidado };
        delete usuarioLimpio.token;

        restaurarSesion(usuarioLimpio);
        setPermitido(true);
        setValidando(false);
      } catch {
        cerrarSesion();
      }
    };

    validarSesion();

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutaActual, idUsuario]);

  useEffect(() => {
    if (!permitido) return undefined;

    const cerrarPorInactividad = () => {
      localStorage.removeItem("avrill_ultima_actividad");
      cerrarSesionRef.current();
    };

    const reiniciarTemporizador = () => {
      localStorage.setItem(
        "avrill_ultima_actividad",
        Date.now().toString()
      );

      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(
        cerrarPorInactividad,
        TIEMPO_INACTIVIDAD
      );
    };

    const manejarActividad = () => reiniciarTemporizador();

    EVENTOS_ACTIVIDAD.forEach((evento) =>
      window.addEventListener(evento, manejarActividad)
    );

    reiniciarTemporizador();

    return () => {
      clearTimeout(temporizador.current);
      EVENTOS_ACTIVIDAD.forEach((evento) =>
        window.removeEventListener(evento, manejarActividad)
      );
    };
  }, [permitido]);

  if (validando || !permitido) {
    return (
      <main className="pagina paginas-cargando">
        <p>Validando sesion, espera un momento...</p>
      </main>
    );
  }

  return <>{children}</>;
}