import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginFormulario() {
  const {
    iniciarSesion,
    registrarUsuario,
    navigate,
  } = useAppContext();

  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");

  const [datosNuevo, setDatosNuevo] = useState({
    usuario: "",
    clave: "",
    nombre: "",
    correo: "",
    telefono: "",
  });

  const [cargando, setCargando] = useState(false);

  const enviarLogin = async (event) => {
    event.preventDefault();
    setCargando(true);
    setError("");

    try {
      const usuarioAutenticado = await iniciarSesion({
        usuario: usuario.trim(),
        clave,
      });
      navigate(usuarioAutenticado.rol === "admin" ? "/dashboard" : "/usuario");
    } catch (errorLogin) {
      if (errorLogin.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (errorLogin.status === 429) {
        setError("Demasiados intentos. Espera unos minutos y vuelve a intentar.");
      } else {
        setError("No se pudo conectar con el servicio de acceso. Inténtalo de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  const enviarRegistro = async (event) => {
    event.preventDefault();
    setCargando(true);
    setError("");

    try {
      await registrarUsuario(datosNuevo);
      navigate("/usuario");
    } catch (errorRegistro) {
      setError(errorRegistro.status === 409
        ? "Ese usuario o correo ya está registrado."
        : errorRegistro.message || "No se pudo completar el registro. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarNuevo = (campo, valor) => {
    setDatosNuevo((actuales) => ({ ...actuales, [campo]: valor }));
  };

  return (
    <>
      {modo === "login" ? (
        <form className="formulario" onSubmit={enviarLogin}>
          <label>Usuario</label>
          <input
            maxLength={40}
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            placeholder="Escribe tu usuario"
            required
          />

          <label>Contraseña</label>
          <div className="campo-contrasena">
            <input
              type={mostrarClave ? "text" : "password"}
              maxLength={40}
              value={clave}
              onChange={(event) => setClave(event.target.value)}
              placeholder="Escribe tu contraseña"
              autoComplete="current-password"
              required
            />
            <button
              className="alternar-visibilidad-clave"
              type="button"
              aria-label={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={mostrarClave}
              onClick={() => setMostrarClave((visible) => !visible)}
            >
              {mostrarClave ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </button>
          </div>

          {error && <p className="mensaje-error">{error}</p>}

          <button
            className="btn-principal btn-ancho"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

          <button
            type="button"
            className="btn-texto"
            onClick={() => setModo("registro")}
          >
            Crear una cuenta nueva
          </button>
        </form>
      ) : (
        <form className="formulario" onSubmit={enviarRegistro}>
          <label>Nombre completo</label>
          <input
            value={datosNuevo.nombre}
            onChange={(event) =>
              cambiarNuevo("nombre", event.target.value)
            }
            placeholder="Tu nombre"
            required
          />

          <label>Usuario</label>
          <input
            value={datosNuevo.usuario}
            minLength={3}
            maxLength={40}
            onChange={(event) =>
              cambiarNuevo("usuario", event.target.value)
            }
            placeholder="Elige un usuario"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={datosNuevo.clave}
            minLength={10}
            maxLength={72}
            onChange={(event) =>
              cambiarNuevo("clave", event.target.value)
            }
            placeholder="Crea una contraseña"
            required
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            value={datosNuevo.correo}
            onChange={(event) =>
              cambiarNuevo("correo", event.target.value)
            }
            placeholder="tucorreo@ejemplo.com"
            required
          />

          <label>Teléfono</label>
          <input
            type="tel"
            value={datosNuevo.telefono}
            onChange={(event) =>
              cambiarNuevo("telefono", event.target.value)
            }
            placeholder="Número de teléfono"
            required
          />

          {error && <p className="mensaje-error">{error}</p>}

          <button
            className="btn-principal btn-ancho"
            disabled={cargando}
          >
            {cargando ? "Registrando..." : "Registrarme"}
          </button>

          <button
            type="button"
            className="btn-texto"
            onClick={() => setModo("login")}
          >
            Ya tengo una cuenta
          </button>
        </form>
      )}
    </>
  );
}