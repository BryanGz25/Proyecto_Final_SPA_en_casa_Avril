/**
 * Utilidades para manejo de Cookies y localStorage
 */

// Manejo de Cookies
export function obtenerCookie(nombre) {
  const coincidencias = document.cookie.match(
    new RegExp("(?:^|; )" + nombre.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
  );
  return coincidencias ? decodeURIComponent(coincidencias[1]) : null;
}

export function guardarCookie(nombre, valor, dias = 7) {
  const fecha = new Date();
  fecha.setTime(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${fecha.toUTCString()}; path=/; SameSite=Lax`;
}

export function borrarCookie(nombre) {
  document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Manejo de localStorage para el Carrito
export function obtenerCarritoStorage() {
  try {
    const guardado = localStorage.getItem("avrill_carrito");
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

export function guardarCarritoStorage(carrito) {
  try {
    localStorage.setItem("avrill_carrito", JSON.stringify(carrito));
  } catch (error) {
    console.error("Error al guardar el carrito en localStorage:", error);
  }
}