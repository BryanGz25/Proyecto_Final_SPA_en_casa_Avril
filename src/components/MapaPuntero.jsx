import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_INICIAL = { lat: 9.8893, lng: -84.0657 };

const NOMINATIM = "https://nominatim.openstreetmap.org";

const iconoPuntero = L.divIcon({
  className: "puntero-mapa",
  html: `
    <svg viewBox="0 0 24 24" width="34" height="46" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="#a96447"
        stroke="#ffffff"
        stroke-width="1.5"
      />
    </svg>
  `,
  iconSize: [34, 46],
  iconAnchor: [17, 44],
});

const formatearDireccion = (resultado) => {
  const partes = [];

  if (resultado.name) partes.push(resultado.name);

  const a = resultado.address || {};
  const via = a.road || a.pedestrian || a.footway || a.path;

  if (via) {
    partes.push(
      a.house_number ? `${a.house_number}, ${via}` : via
    );
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

const obtenerCoordenadas = async (direccion) => {
  const respuesta = await fetch(
    `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(direccion)}&limit=1&accept-language=es`,
    { headers: { Accept: "application/json" } }
  );

  if (!respuesta.ok) throw new Error("No se pudo buscar");

  const resultados = await respuesta.json();
  const primero = resultados?.[0];

  if (!primero) throw new Error("Sin resultados");

  return { lat: Number(primero.lat), lng: Number(primero.lon) };
};

const obtenerDireccion = async (lat, lng) => {
  const respuesta = await fetch(
    `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`,
    { headers: { Accept: "application/json" } }
  );

  if (!respuesta.ok) throw new Error("No se pudo obtener la dirección");

  const resultado = await respuesta.json();

  return formatearDireccion(resultado);
};

const etiquetaSugerencia = (resultado) => {
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

const colocarPuntero = (marcador, mapa, lat, lng) => {
  marcador.setLatLng([lat, lng]);
  mapa.panTo([lat, lng]);
};

export default function MapaPuntero({ valor, onUbicar }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const onUbicarRef = useRef(onUbicar);

  const [direccion, setDireccion] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    onUbicarRef.current = onUbicar;
  });

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, {
      scrollWheelZoom: false,
    }).setView(
      [CENTRO_INICIAL.lat, CENTRO_INICIAL.lng],
      14
    );

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(mapa);

    const marcador = L.marker(
      [CENTRO_INICIAL.lat, CENTRO_INICIAL.lng],
      { draggable: true, icon: iconoPuntero }
    ).addTo(mapa);

    mapaRef.current = mapa;
    marcadorRef.current = marcador;

    const aplicarPunto = (lat, lng) => {
      colocarPuntero(marcador, mapa, lat, lng);
      setCoordenadas({ lat, lng });

      obtenerDireccion(lat, lng)
        .then((texto) => {
          setDireccion(texto);
          onUbicarRef.current?.({ direccion: texto, lat, lng });
        })
        .catch(() => {
          const texto = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setDireccion(texto);
          onUbicarRef.current?.({ direccion: texto, lat, lng });
        });
    };

    mapa.on("click", (evento) => {
      aplicarPunto(evento.latlng.lat, evento.latlng.lng);
    });

    marcador.on("dragend", () => {
      const posicion = marcador.getLatLng();
      aplicarPunto(posicion.lat, posicion.lng);
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!valor || !mapaRef.current) return;

    let cancelado = false;
    let puntoSeleccionado = null;

    obtenerCoordenadas(valor)
      .then((punto) => {
        if (cancelado || !mapaRef.current || !marcadorRef.current) {
          return "";
        }

        puntoSeleccionado = punto;

        colocarPuntero(
          marcadorRef.current,
          mapaRef.current,
          punto.lat,
          punto.lng
        );
        setCoordenadas(punto);

        return obtenerDireccion(punto.lat, punto.lng);
      })
      .then((texto) => {
        if (cancelado || !texto || !puntoSeleccionado) return;

        setDireccion(texto);
        onUbicarRef.current?.({
          direccion: texto,
          lat: puntoSeleccionado.lat,
          lng: puntoSeleccionado.lng,
        });
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [valor]);

  const buscarLugar = async () => {
    const consulta = busqueda.trim();

    if (!consulta) {
      setSugerencias([]);
      return;
    }

    setBuscando(true);

    try {
      const respuesta = await fetch(
        `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(consulta)}&limit=6&addressdetails=1&accept-language=es`,
        { headers: { Accept: "application/json" } }
      );

      if (!respuesta.ok) throw new Error("No se pudo buscar");

      const resultados = await respuesta.json();

      setSugerencias(
        resultados.map((resultado) => ({
          name: resultado.display_name,
          lat: Number(resultado.lat),
          lng: Number(resultado.lon),
          etiqueta: etiquetaSugerencia(resultado),
        }))
      );
    } catch {
      setSugerencias([]);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarLugar = async (lugar) => {
    setBusqueda("");
    setSugerencias([]);

    if (!mapaRef.current || !marcadorRef.current) return;

    colocarPuntero(marcadorRef.current, mapaRef.current, lugar.lat, lugar.lng);
    setCoordenadas({
      lat: lugar.lat,
      lng: lugar.lng,
    });

    const texto = await obtenerDireccion(lugar.lat, lugar.lng).catch(
      () => lugar.name
    );

    setDireccion(texto);
    onUbicarRef.current?.({
      direccion: texto,
      lat: lugar.lat,
      lng: lugar.lng,
    });
  };

  const redondear = (numero) => Number(numero.toFixed(6));

  return (
    <div className="mapa-entrega-contenido">
      <div className="busqueda-mapa">
        <input
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            if (!evento.target.value) setSugerencias([]);
          }}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              buscarLugar();
            }
          }}
          placeholder="Busca un negocio o punto de referencia…"
          aria-label="Buscar negocio o punto de referencia"
        />

        <button
          type="button"
          className="btn-secundario"
          onClick={buscarLugar}
          disabled={buscando}
        >
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {sugerencias.length > 0 && (
        <ul className="sugerencias-mapa">
          {sugerencias.map((sugerencia, indice) => (
            <li key={`${sugerencia.lat}-${sugerencia.lng}-${indice}`}>
              <button
                type="button"
                onClick={() => seleccionarLugar(sugerencia)}
              >
                <span className="sugerencia-nombre">
                  {sugerencia.name}
                </span>
                <span className="sugerencia-etiqueta">
                  {sugerencia.etiqueta}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mapa-puntero" ref={contenedorRef} />

      {direccion && (
        <span className="mapa-direccion">
          Dirección: {direccion}
        </span>
      )}

      <div className="mapa-pie">
        <span className="mapa-coordenadas">
          {coordenadas
            ? `${redondear(coordenadas.lat)}, ${redondear(coordenadas.lng)}`
            : "Mueve el puntero o haz clic en el mapa"}
        </span>

        {coordenadas && (
          <a
            className="btn-secundario mapa-enlace"
            href={`https://www.google.com/maps/search/?api=1&query=${redondear(coordenadas.lat)},${redondear(coordenadas.lng)}`}
            rel="noreferrer"
            target="_blank"
          >
            Abrir en Google Maps
          </a>
        )}
      </div>

      <small>
        Arrastra o haz clic en el mapa para afinar el punto de
        entrega. Al elegir una ubicación, la dirección con
        coordenadas se copia al formulario.
      </small>
    </div>
  );
}