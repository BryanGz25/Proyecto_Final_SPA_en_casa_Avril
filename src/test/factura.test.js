import { describe, expect, test } from 'vitest';
import { calcularTotalesFactura, construirFactura, facturaHtml } from '../utils/factura';

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

  test('escapa HTML proporcionado en los datos de la factura', () => {
    const factura = construirFactura({
      id: 12,
      fecha: '2026-09-30T12:00:00.000Z',
      cliente: {
        nombre: '<img src=x onerror=alert(1)>',
        correo: 'cliente@example.com',
      },
      productos: [
        { id: 1, nombre: '<script>alert(1)</script>', precio: 1000, cantidad: 1 },
      ],
    });

    const html = facturaHtml(factura);

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });
});
