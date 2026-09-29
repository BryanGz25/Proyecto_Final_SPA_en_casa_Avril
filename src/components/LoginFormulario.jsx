import { useState } from "react";
import { useAppContext } from "../routes/Routing";

export default function LoginFormulario() {
  const {
    usuarios,
    iniciarSesion,
    registrarUsuario,
    navigate,
  } = useAppContext();

  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
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

    const encontrado = usuarios.find(
      (item) =>
        item.usuario === usuario && item.clave === clave
    );

    if (!encontrado) {
      setError("Usuario o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    try {
      const sesionCreada = await iniciarSesion(encontrado);

      if (!sesionCreada) {
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
        setCargando(false);
        return;
      }

      setCargando(false);
      navigate(
        encontrado.rol === "admin" ? "/dashboard" : "/usuario"
      );
    } catch {
      setError(
        "No se pudo conectar con el servidor de base de datos. Ejecuta 'npm run server' para poder iniciar sesión."
      );
      setCargando(false);
    }
  };

  const enviarRegistro = async (event) => {
    event.preventDefault();
    setCargando(true);
    setError("");

    const repetido = usuarios.find(
      (item) =>
        item.usuario === datosNuevo.usuario ||
        item.correo === datosNuevo.correo
    );

    if (repetido) {
      setError(
        "Ese usuario o correo ya está registrado en la base de datos."
      );
      setCargando(false);
      return;
    }

    try {
      await registrarUsuario(datosNuevo);
      setCargando(false);
      navigate("/usuario");
    } catch {
      setError(
        "No se pudo conectar con el servidor de base de datos. Ejecuta 'npm run server' para poder registrarte."
      );
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
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            placeholder="Escribe tu usuario"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={clave}
            onChange={(event) => setClave(event.target.value)}
            placeholder="Escribe tu contraseña"
            required
          />

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