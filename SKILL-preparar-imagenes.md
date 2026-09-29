---
name: preparar-imagenes-avrill
description: Prepara, recorta, comprime, nombra y registra imágenes (productos, logo e iconos) para la SPA "Avrill un spa en casa". Úsala cuando se pida agregar, reemplazar u optimizar una imagen para que se vea correcta en la página, sin deformarse ni pixelarse.
---

# Skill: Preparar imágenes para "Avrill un spa en casa"

Esta skill describe **cómo debe una IA transformar cualquier imagen** (foto de producto, logo o icono)
para que quede lista para presentarse en esta SPA, y **cómo registrarla** para que aparezca en la página.

---

## 1. Cuándo usar esta skill

Actívala cuando el usuario pida:

- Agregar o reemplazar la imagen de un producto.
- Optimizar imágenes que se ven pesadas, borrosas, deformadas o recortadas raro.
- Preparar un lote de fotos nuevas para el catálogo.
- Cambiar el logo o el icono del carrito.

---

## 2. Dónde aparecen las imágenes (mapa real del proyecto)

| Ubicación | Componente / selector | Archivo |
|---|---|---|
| Tarjeta de producto (Home y Catálogo) | `img.producto-imagen` dentro de `.producto-card` | `src/components/TarjetaProducto.jsx` |
| Detalle de producto | `.detalle-producto img` | `src/pages/DetalleProducto.jsx` |
| Miniatura del carrito | `.carrito-item img` | `src/pages/Carrito.jsx` |
| Editor de producto (Dashboard) | `.editor-producto img` | `src/components/EditorProducto.jsx` |
| Logo del encabezado | `.logo img` | `src/components/Encabezado.jsx` |
| Icono del botón carrito | `.boton-carrito img` | `src/components/Encabezado.jsx` |
| Archivos estáticos | carpeta `public/` | servida en la raíz `/` |

Reglas CSS relevantes (de `src/styles/global.css` y `src/App.css`):

- `.producto-imagen` → `aspect-ratio: 1 / 1; object-fit: cover;` (recorte cuadrado).
- `.detalle-producto img` → `width: 100%; max-height: 600px; object-fit: cover;`.
- `.carrito-item img` → `120px × 120px; object-fit: cover;`.
- `.logo img` → `height: 88px; width: auto; object-fit: contain;`.
- La grilla de productos es de **4 columnas** con `max-width: 1200px` (≈ 270 px de ancho por tarjeta en escritorio).

> **Regla de oro:** como la tarjeta recorta a **cuadrado (1:1)**, se debe exportar cada producto como
> **cuadrado**. Una sola imagen cuadrada sirve para Home, Catálogo, Detalle, Carrito y el editor.

---

## 3. Especificaciones exactas (obligatorias)

| Uso | Proporción | Resolución de exportación | Formato | Peso objetivo |
|---|---|---|---|---|
| **Producto (recomendado, único)** | **1:1** | **1200 × 1200 px** | WebP (o JPG) | ≤ 200 KB |
| Producto (mínimo aceptable) | 1:1 | 800 × 800 px | WebP/JPG | ≤ 250 KB |
| Detalle alternativo (opcional, panorámico) | 3:2 | 1200 × 800 px | WebP/JPG | ≤ 250 KB |
| Logo | horizontal libre | 400 px de ancho (alto ~220) | PNG/WebP con fondo transparente | ≤ 80 KB |
| Icono carrito | 1:1 | 80 × 80 px | PNG/SVG | ≤ 20 KB |

Notas:

- **No superar** los 2000 px de lado: no aporta nitidez y aumenta el peso.
- Usar **WebP** siempre que se pueda (mejor compresión). Si algo debe ser PNG (logo con transparencia), PNG-24 o PNG-8 optimizado.
- **Nunca** estirar ni aplastar: si la foto original no es cuadrada, se **recorta** (no se deforma) al centro.

---

## 4. Estilo visual del sitio (para encuadre y fondo)

Paleta del sitio (usar como referencia de fondo/ambiente):

- Verde principal `#4a5d4e`, verde oscuro `#334537`
- Crema `#fdfbf7`, crema suave `#faf6f0`, arena `#e8e2d8`
- Terracota `#a96447`

Criterios de imagen:

- **Producto centrado**, con margen libre alrededor (aprox. 10–15 % del borde).
- Fondo **claro y neutro** (crema, blanco, beige, madera clara) que combine con la paleta.
- Luz suave y uniforme; evitar sombras duras, reflejos o fondos con mucho ruido visual.
- Sin texto, precios, marcas de agua ni bordes añadidos (la etiqueta y el precio ya los pone la página).
- Mantener consistencia entre productos: mismo estilo de fondo y encuadre.
- **Zona segura:** como `object-fit: cover` recorta a cuadrado, el producto debe estar dentro del **80 % central** del lienzo. Así no se corta nada al recuadrar.

---

## 5. Proceso paso a paso que debe seguir la IA

1. **Recibir** la imagen original (y saber para qué producto es).
2. **Analizar**: ancho × alto, si tiene transparencia y qué parte es "importante".
3. **Recortar a 1:1 centrado** en el objeto principal (no estirar).
4. **Redimensionar** a 1200 × 1200 px (o 800 mínimo).
5. **Convertir** a WebP calidad 80–85 (JPG calidad 82 si no hay soporte WebP).
6. **Optimizar** hasta bajar de ~200 KB.
7. **Nombrar** con la convención de la sección 7.
8. **Ubicar** en `public/imagenes/productos/` (o usar URL externa).
9. **Registrar** la ruta en la base de datos (sección 8).
10. **Validar** con el checklist (sección 9).

---

## 6. Comandos de conversión (copia y ajusta)

### ImageMagick (el más simple)
```bash
# 1) Recortar centrado a cuadrado y redimensionar 1200x1200
magick foto.jpg -auto-orient -resize 1200x1200^ -gravity center -extent 1200x1200 \
  -strip -quality 82 public/imagenes/productos/mi-producto.webp

# Variante mínima 800x800
magick foto.jpg -auto-orient -resize 800x800^ -gravity center -extent 800x800 \
  -strip -quality 82 public/imagenes/productos/mi-producto.webp
```
> `-resize 1200x1200^` escala para cubrir el cuadrado y `-extent` recorta centrado.

### ffmpeg
```bash
ffmpeg -i foto.jpg -vf "scale=1200:1200:force_original_aspect_ratio=increase,crop=1200:1200" \
  -q:v 80 public/imagenes/productos/mi-producto.webp
```

### Python (Pillow)
```python
from PIL import Image, ImageOps
im = Image.open("foto.jpg")
im = ImageOps.exif_transpose(im)
im = ImageOps.fit(im, (1200, 1200), Image.LANCZOS, centering=(0.5, 0.5))
im.save("public/imagenes/productos/mi-producto.webp", "WEBP", quality=82, method=6)
```

### Node (sharp) — ya es ecosistema Vite/JS
```js
import sharp from "sharp";
await sharp("foto.jpg")
  .rotate()
  .resize(1200, 1200, { fit: "cover", position: "centre" })
  .webp({ quality: 82 })
  .toFile("public/imagenes/productos/mi-producto.webp");
```

---

## 7. Convención de nombres y ubicación

- Carpeta destino: **`public/imagenes/productos/`**.
- Nombre en **minúsculas, sin espacios ni tildes**, con guiones:
  `jabon-botanico-nutritivo.webp`
- Formato: `<nombre-producto>.webp` (si hay varias vistas: `<nombre-producto>-1.webp`, `-2.webp`).
- La URL pública es con **barra inicial** y sin `public`:
  `/imagenes/productos/jabon-botanico-nutritivo.webp`
- El logo y el icono del carrito viven directo en `public/` (`logo-avrill.jpeg`, `carrito-icon.png`) y se referencian como `/logo-avrill.jpeg`.

> Evita depender de URLs externas si puedes alojar la imagen en `public/`: cargan más rápido y no se rompen si el sitio enlazado la elimina.

---

## 8. Cómo registrar la imagen para que se vea en la página

El campo de imagen del producto es `producto.imagen` (una URL o ruta). Hay dos formas:

### Opción A — desde el panel (usuario admin)
1. Iniciar sesión como admin (`admin` / `admin123`).
2. Ir a **Dashboard → Inventario**.
3. En **Nuevo producto**, o al editar un producto existente, poner en **URL de imagen**:
   - Ruta local: `/imagenes/productos/mi-producto.webp`
   - o una URL externa completa `https://...`
4. Guardar. Se persiste en `db.json` en la colección `"productos"`.

### Opción B — editando `db.json` directamente
En `db.json`, dentro de `"productos"`, el objeto del producto debe quedar así:

```json
{
  "id": 5,
  "nombre": "Jabon de Avena",
  "categoria": "jabones",
  "detalle": "Jabon suave con avena para piel sensible.",
  "precio": 3800,
  "disponible": true,
  "etiqueta": "Nuevo",
  "imagen": "/imagenes/productos/jabon-de-avena.webp"
}
```

Categorías válidas: `jabones`, `sales`, `splash`, `decorativos`.
El campo `imagen` debe estar como **ruta con `/` inicial** (archivo en `public/`) o **URL completa** (`https://...`).

---

## 9. Checklist de validación (antes de dar por lista la imagen)

- [ ] Es cuadrada **1:1** (o 3:2 si es el detalle panorámico opcional).
- [ ] Mide al menos **800 px**, ideal **1200 px** de lado.
- [ ] Pesa ≤ **200 KB** (WebP/JPG) — verificar con `magick identify -format "%b" archivo.webp` o el explorador de archivos.
- [ ] El producto **no está deformado** ni cortado en los bordes.
- [ ] El producto está centrado dentro de la **zona segura (80 % central)**.
- [ ] El fondo es claro/neutro y combina con la paleta (verde/crema/arena/terracota).
- [ ] Nombre de archivo en minúsculas, con guiones y sin tildes.
- [ ] El archivo está en `public/imagenes/productos/` y la ruta en `db.json` empieza con `/imagenes/productos/...`.
- [ ] Se probó en **Home, Catálogo, Detalle y Carrito**: se ve bien en los cuatro.
- [ ] El `alt` correcto: la página usa `alt={producto.nombre}`, así que **el nombre del producto no debe llevar errores** para accesibilidad/SEO.

---

## 10. Errores comunes que la IA debe evitar

- **Deformar** para "cuadrar": siempre recortar centrado, nunca estirar.
- Exportar en **2000 px o más** "por si acaso": solo aumenta el peso.
- Dejar **mucho aire** o el producto pegado al borde (se recorta con `object-fit: cover`).
- Nombres con **espacios, tildes o mayúsculas** (`Jabón Bonito FINAL.png`) que rompen URLs.
- Poner la imagen en `src/` y referenciarla como `/src/...` — **no funciona**; debe ir en `public/`.
- Olvidar el **`/` inicial** en la ruta (`imagenes/productos/x.webp` en vez de `/imagenes/productos/x.webp`).
- Usar un formato/URL que no cargue (enlace roto): probar la ruta en el navegador antes de cerrar.

---

## 11. Resultado esperado

Una imagen de producto lista queda así:

- Formato: **WebP**.
- Tamaño: **1200 × 1200 px**, ≤ 200 KB.
- Ruta: `public/imagenes/productos/<slug>.webp`.
- Registro: `"imagen": "/imagenes/productos/<slug>.webp"` dentro de `db.json` → `productos`.
- Visual: cuadrada, centrada, fondo claro, sin deformaciones, coherente con la paleta de Avrill.
