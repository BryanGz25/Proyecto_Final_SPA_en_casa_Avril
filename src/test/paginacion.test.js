import { describe, expect, it } from "vitest";
import { obtenerPaginasVisibles } from "../utils/paginacion.js";

const numeros = (paginas) => paginas.filter((p) => typeof p === "number");
const ellipsis = (paginas) => paginas.filter((p) => typeof p === "string");

describe("obtenerPaginasVisibles", () => {
  it("devuelve todas las páginas cuando son pocas", () => {
    expect(obtenerPaginasVisibles(1, 1)).toEqual([1]);
    expect(obtenerPaginasVisibles(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(obtenerPaginasVisibles(3, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("devuelve lista vacía sin páginas", () => {
    expect(obtenerPaginasVisibles(1, 0)).toEqual([]);
  });

  it("muestra primera, actual y última con puntos suspensivos", () => {
    expect(obtenerPaginasVisibles(10, 20)).toEqual([
      1,
      "inicio-ellipsis",
      9,
      10,
      11,
      "fin-ellipsis",
      20,
    ]);
  });

  it("omite el punto suspensivo izquierdo cuando está en el inicio", () => {
    expect(obtenerPaginasVisibles(1, 20)).toEqual([1, 2, "fin-ellipsis", 20]);
    expect(obtenerPaginasVisibles(2, 20)).toEqual([
      1,
      2,
      3,
      "fin-ellipsis",
      20,
    ]);
    expect(obtenerPaginasVisibles(3, 20)).toEqual([
      1,
      2,
      3,
      4,
      "fin-ellipsis",
      20,
    ]);
  });

  it("omite el punto suspensivo derecho cuando está en el final", () => {
    expect(obtenerPaginasVisibles(20, 20)).toEqual([
      1,
      "inicio-ellipsis",
      19,
      20,
    ]);
    expect(obtenerPaginasVisibles(19, 20)).toEqual([
      1,
      "inicio-ellipsis",
      18,
      19,
      20,
    ]);
  });

  it("no repite páginas ni genera botones fuera de rango", () => {
    for (let total = 7; total <= 40; total++) {
      for (let actual = 1; actual <= total; actual++) {
        const paginas = obtenerPaginasVisibles(actual, total);
        const lista = numeros(paginas);

        expect(lista[0]).toBe(1);
        expect(lista[lista.length - 1]).toBe(total);
        expect(new Set(lista).size).toBe(lista.length);
        expect(Math.min(...lista)).toBe(1);
        expect(Math.max(...lista)).toBe(total);

        const ventanaActual = lista.filter(
          (p) => p === actual || p === actual - 1 || p === actual + 1
        );
        expect(ventanaActual).toContain(actual);

        // El punto inicial solo aparece si hay un hueco real.
        if (paginas.includes("inicio-ellipsis")) expect(lista[1]).toBeGreaterThan(2);
        // El punto final solo aparece si hay un hueco real.
        if (paginas.includes("fin-ellipsis")) {
          expect(lista[lista.length - 2]).toBeLessThan(total - 1);
        }
        expect(ellipsis(paginas).every((p) => p.includes("ellipsis"))).toBe(true);
      }
    }
  });

  it("recorta páginas fuera de rango en vez de romper", () => {
    expect(obtenerPaginasVisibles(999, 20)).toEqual([
      1,
      "inicio-ellipsis",
      19,
      20,
    ]);
    expect(obtenerPaginasVisibles(0, 20)).toEqual([1, 2, "fin-ellipsis", 20]);
    expect(obtenerPaginasVisibles(-5, 20)).toEqual([1, 2, "fin-ellipsis", 20]);
  });

  it("mantiene el número de páginas visible acotado", () => {
    for (let actual = 1; actual <= 200; actual++) {
      const paginas = obtenerPaginasVisibles(actual, 200);
      expect(paginas.length).toBeLessThanOrEqual(7);
    }
  });
});
