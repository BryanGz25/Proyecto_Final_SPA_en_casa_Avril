const BASE = "/api";

const peticion = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo completar la peticion ${ruta}: ${respuesta.status}`
    );
  }

  return respuesta.json();
};

export const apiUsuarios = {
  listar: () => peticion("/usuarios"),

  obtener: (id) => peticion(`/usuarios/${id}`),

  crear: (datos) =>
    peticion("/usuarios", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  actualizar: async (id, datos) => {
    const actual = await peticion(`/usuarios/${id}`);

    return peticion(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...actual, ...datos, id }),
    });
  },

  eliminar: (id) =>
    peticion(`/usuarios/${id}`, {
      method: "DELETE",
    }),
};

export const apiProductos = {
  listar: () => peticion("/productos"),

  obtener: (id) => peticion(`/productos/${id}`),

  crear: (datos) =>
    peticion("/productos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  actualizar: async (id, datos) => {
    const actual = await peticion(`/productos/${id}`);

    return peticion(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...actual, ...datos, id }),
    });
  },

  eliminar: (id) =>
    peticion(`/productos/${id}`, {
      method: "DELETE",
    }),
};

const generarToken = () => {
  const azar = Math.random().toString(36).slice(2);
  const tiempo = Date.now().toString(36);
  const cadena = `${azar}.${tiempo}.${datosAleatorios(8)}`;

  return btoa(cadena).replace(/=+$/, "");
};

const datosAleatorios = (cantidad) => {
  const letras =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resultado = "";

  for (let i = 0; i < cantidad; i += 1) {
    resultado += letras[Math.floor(Math.random() * letras.length)];
  }

  return resultado;
};

export const apiSesion = {
  iniciar: async (usuario) => {
    const token = generarToken();
    const actualizado = await apiUsuarios.actualizar(usuario.id, {
      token,
    });

    return { usuario: actualizado, token };
  },

  validar: async (token, id) => {
    try {
      const usuario = await apiUsuarios.obtener(id);

      if (usuario && usuario.token && usuario.token === token) {
        return usuario;
      }
    } catch {
      return null;
    }

    return null;
  },

  cerrar: async (id) => {
    try {
      const usuario = await apiUsuarios.obtener(id);

      if (usuario) {
        await apiUsuarios.actualizar(id, { token: null });
      }
    } catch {
      return null;
    }

    return null;
  },
};