const NOMINATIM = "https://nominatim.openstreetmap.org";

const CODIGO_PAIS = "cr";

export const LIMITES_COSTA_RICA = {
  oeste: -86.2,
  sur: 8.0,
  este: -82.3,
  norte: 11.5,
};

const CENTRO_COSTA_RICA = { lat: 9.7489, lng: -83.7534 };

export const ESTILO_MAPBOX = "mapbox://styles/mapbox/standard-satellite";

const ETIQUETAS_MAPBOX = {
  address: "Dirección",
  street: "Calle",
  neighborhood: "Barrio",
  place: "Ciudad",
  poi: "Negocio",
};

let tokenVerificado = null;

export function obtenerTokenMapbox() {
  return (import.meta.env.VITE_MAPBOX_TOKEN || "").trim();
}

export function soportaWebGL() {
  try {
    const lienzo = document.createElement("canvas");

    return Boolean(
      window.WebGLRenderingContext &&
        (lienzo.getContext("webgl2") || lienzo.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export async function validarTokenMapbox(token) {
  if (!token) return false;
  if (tokenVerificado === token) return true;

  const estilo = ESTILO_MAPBOX.replace("mapbox://styles/", "");

  try {
    const respuesta = await fetch(
      `https://api.mapbox.com/styles/v1/${estilo}?access_token=${encodeURIComponent(token)}`,
      { headers: { Accept: "application/json" } }
    );

    if (respuesta.ok) {
      tokenVerificado = token;
      return true;
    }

    tokenVerificado = null;

    return false;
  } catch {
    tokenVerificado = null;

    return false;
  }
}

const pedirJson = async (url) => {
  const respuesta = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) throw new Error("No se pudo consultar el servicio");

  return respuesta.json();
};

const coordenadaNumero = (valor) => {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
};

const leerCoordenadas = (feature) => {
  const punto = feature?.properties?.coordinates;

  if (punto) {
    const lat = coordenadaNumero(punto.latitude);
    const lng = coordenadaNumero(punto.longitude);

    if (lat !== null && lng !== null) return { lat, lng };
  }

  const geometria = feature?.geometry?.coordinates;

  if (Array.isArray(geometria)) {
    const lng = coordenadaNumero(geometria[0]);
    const lat = coordenadaNumero(geometria[1]);

    if (lat !== null && lng !== null) return { lat, lng };
  }

  return null;
};

export async function buscarEnMapbox(consulta, token, limite = 6) {
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");

  url.searchParams.set("q", consulta);
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", "es");
  url.searchParams.set("country", CODIGO_PAIS);
  url.searchParams.set(
    "proximity",
    `${CENTRO_COSTA_RICA.lng},${CENTRO_COSTA_RICA.lat}`
  );
  url.searchParams.set("limit", String(limite));

  const datos = await pedirJson(url);

  return (datos.features || [])
    .map((feature) => {
      const punto = leerCoordenadas(feature);

      if (!punto) return null;

      const propiedades = feature.properties || {};

      return {
        name:
          propiedades.full_address ||
          [propiedades.name, propiedades.place_formatted]
            .filter(Boolean)
            .join(", "),
        lat: punto.lat,
        lng: punto.lng,
        etiqueta: ETIQUETAS_MAPBOX[propiedades.feature_type] || "Referencia",
      };
    })
    .filter(Boolean);
}

export async function direccionDesdeMapbox(lat, lng, token) {
  const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse");

  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", "es");
  url.searchParams.set("country", CODIGO_PAIS);

  const datos = await pedirJson(url);
  const propiedades = datos.features?.[0]?.properties;

  if (!propiedades) throw new Error("Sin resultados");

  const texto =
    propiedades.full_address ||
    [propiedades.name, propiedades.place_formatted].filter(Boolean).join(", ");

  if (!texto) throw new Error("Sin resultados");

  return texto;
}

const formatearDireccionNominatim = (resultado) => {
  const partes = [];

  if (resultado.name) partes.push(resultado.name);

  const a = resultado.address || {};
  const via = a.road || a.pedestrian || a.footway || a.path;

  if (via) {
    partes.push(a.house_number ? `${a.house_number}, ${via}` : via);
  } else if (a.house_number) {
    partes.push(a.house_number);
  }

  if (a.neighbourhood) partes.push(a.neighbourhood);

  const poblado =
    a.town || a.village || a.city || a.county || a.municipality;

  if (poblado && !partes.includes(poblado)) partes.push(poblado);
  if (a.state && !partes.includes(a.state)) partes.push(a.state);

  if (partes.length === 0) partes.push(resultado.display_name);

  return partes.slice(0, 5).join(", ");
};

const etiquetaNominatim = (resultado) => {
  const negocios = [
    "shop",
    "cafe",
    "restaurant",
    "tourism",
    "office",
    "amenity",
    "leisure",
  ];

  if (negocios.includes(resultado.class)) return "Negocio";

  return "Referencia";
};

export async function buscarEnNominatim(consulta, limite = 6) {
  const url = new URL(`${NOMINATIM}/search`);

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", consulta);
  url.searchParams.set("limit", String(limite));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");
  url.searchParams.set("countrycodes", CODIGO_PAIS);

  const resultados = await pedirJson(url);

  return resultados
    .map((resultado) => {
      const lat = coordenadaNumero(resultado.lat);
      const lng = coordenadaNumero(resultado.lon);

      if (lat === null || lng === null) return null;

      return {
        name: resultado.display_name,
        lat,
        lng,
        etiqueta: etiquetaNominatim(resultado),
      };
    })
    .filter(Boolean);
}

export async function direccionDesdeNominatim(lat, lng) {
  const url = new URL(`${NOMINATIM}/reverse`);

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");
  url.searchParams.set("countrycodes", CODIGO_PAIS);

  const resultado = await pedirJson(url);
  const texto = formatearDireccionNominatim(resultado);

  if (!texto) throw new Error("Sin resultados");

  return texto;
}
