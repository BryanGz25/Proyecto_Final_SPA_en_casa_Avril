const MAX_BOTONES_PAGINA = 4;

/**
 * Devuelve la lista de páginas a mostrar en la paginación.
 *
 * Con pocas páginas devuelve todas. Con muchas devuelve una ventana
 * centrada en la actual, con puntos suspensivos: 1 … 9 10 11 … 20
 *
 * Los puntos suspensivos se marcan con las cadenas "inicio-ellipsis" y
 * "fin-ellipsis" para poder distinguirlos de un número de página.
 */
export const obtenerPaginasVisibles = (paginaActual, totalPaginas) => {
  const total = Math.max(0, totalPaginas);
  const actual = Math.min(Math.max(1, paginaActual), Math.max(1, total));

  if (total <= MAX_BOTONES_PAGINA + 2) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const inicio = Math.max(2, actual - 1);
  const fin = Math.min(total - 1, actual + 1);

  const paginas = [1];

  if (inicio > 2) paginas.push("inicio-ellipsis");

  for (let numero = inicio; numero <= fin; numero++) paginas.push(numero);

  if (fin < total - 1) paginas.push("fin-ellipsis");

  paginas.push(total);

  return paginas;
};

export { MAX_BOTONES_PAGINA };
