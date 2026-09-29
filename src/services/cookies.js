export const NOMBRE_COOKIE_TOKEN = "avrill_token";
export const NOMBRE_COOKIE_USUARIO = "avrill_usuario";

export const leerCookie = (nombre) => {
  const coincidencia = document.cookie
    .split("; ")
    .find((fila) => fila.startsWith(`${nombre}=`));

  return coincidencia
    ? decodeURIComponent(coincidencia.split("=")[1])
    : null;
};

export const escribirCookie = (nombre, valor, horas = 24) => {
  const expira = new Date();
  expira.setTime(expira.getTime() + horas * 60 * 60 * 1000);

  document.cookie = `${nombre}=${encodeURIComponent(
    valor
  )}; expires=${expira.toUTCString()}; path=/; SameSite=Lax`;

  return valor;
};

export const borrarCookie = (nombre) => {
  document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};