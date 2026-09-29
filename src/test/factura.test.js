import { describe, expect, test } from 'vitest';
import { calcularTotalesFactura } from '../utils/factura';

describe('Factura', () => {
  test('calcula subtotal, iva y total correctamente', () => {
    const lineas = [
      { precio: 3500, cantidad: 2 },
      { precio: 5000, cantidad: 1 },
    ];

    const resultado = calcularTotalesFactura(lineas);

    expect(resultado.subtotal).toBe(12000);
    expect(resultado.iva).toBe(1560);
    expect(resultado.total).toBe(13560);
  });

  test('maneja carrito vacío sin errores', () => {
    const resultado = calcularTotalesFactura([]);

    expect(resultado.subtotal).toBe(0);
    expect(resultado.iva).toBe(0);
    expect(resultado.total).toBe(0);
  });
});
