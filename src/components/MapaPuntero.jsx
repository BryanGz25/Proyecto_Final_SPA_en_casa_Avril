import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapaMapbox from "./MapaMapbox";
import {
  buscarEnMapbox,
  buscarEnNominatim,
  direccionDesdeMapbox,
  direccionDesdeNominatim,
  LIMITES_COSTA_RICA,
  obtenerTokenMapbox,
  soportaWebGL,
  validarTokenMapbox,
} from "../utils/geocodificacion";

const CENTRO_INICIAL = { lat: 9.8893, lng: -84.0657 };

const TILES = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  atribucion:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const esCoordenadaValida = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng);

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

const mismoPunto = (a, b) =>
  Boolean(a) &&
  Boolean(b) &&
  Math.abs(a.lat - b.lat) < 1e-7 &&
  Math.abs(a.lng - b.lng) < 1e-7;

function MapaLeaflet({ punto, onElegirPunto }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const puntoRef = useRef(punto);
  const onElegirPuntoRef = useRef(onElegirPunto);

  useEffect(() => {
    puntoRef.current = punto;
  }, [punto]);

  useEffect(() => {
    onElegirPuntoRef.current = onElegirPunto;
  });

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, {
      scrollWheelZoom: false,
    });

    const inicial = puntoRef.current || CENTRO_INICIAL;

    mapa.setView([inicial.lat, inicial.lng], 14);

    mapa.setMaxBounds(
      L.latLngBounds(
        L.latLng(LIMITES_COSTA_RICA.sur, LIMITES_COSTA_RICA.oeste),
        L.latLng(LIMITES_COSTA_RICA.norte, LIMITES_COSTA_RICA.este)
      )
    );

    L.tileLayer(TILES.url, {
      attribution: TILES.atribucion,
      maxZoom: 19,
    }).addTo(mapa);

    const marcador = L.marker([inicial.lat, inicial.lng], {
      draggable: true,
      icon: iconoPuntero,
    }).addTo(mapa);

    mapaRef.current = mapa;
    marcadorRef.current = marcador;

    mapa.on("click", (evento) => {
      onElegirPuntoRef.current?.({
        lat: evento.latlng.lat,
        lng: evento.latlng.lng,
      });
    });

    marcador.on("dragend", () => {
      const posicion = marcador.getLatLng();

      onElegirPuntoRef.current?.({
        lat: posicion.lat,
        lng: posicion.lng,
      });
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    const marcador = marcadorRef.current;

    if (!mapa || !marcador || !punto) return;
    if (!esCoordenadaValida(punto.lat, punto.lng)) return;
    if (mismoPunto(marcador.getLatLng(), punto)) return;

    marcador.setLatLng([punto.lat, punto.lng]);
    mapa.panTo([punto.lat, punto.lng]);
  }, [punto]);

  return <div className="mapa-puntero" ref={contenedorRef} />;
}

export default function MapaPuntero({ valor, onUbicar }) {
  const token = obtenerTokenMapbox();

  const [proveedor, setProveedor] = useState(null);
  const [punto, setPunto] = useState(null);
  const [direccion, setDireccion] = useState("");

  const onUbicarRef = useRef(onUbicar);

  useEffect(() => {
    onUbicarRef.current = onUbicar;
  });

  useEffect(() => {
    let cancelado = false;

    const decidir = async () => {
      if (!token || !soportaWebGL()) {
        setProveedor("leaflet");
        return;
      }

      const valido = await validarTokenMapbox(token);

      if (!cancelado) setProveedor(valido ? "mapbox" : "leaflet");
    };

    decidir();

    return () => {
      cancelado = true;
    };
  }, [token]);

  const usarMapbox = proveedor === "mapbox";

  const obtenerDireccion = useCallback(
    (lat, lng) =>
      usarMapbox
        ? direccionDesdeMapbox(lat, lng, token)
        : direccionDesdeNominatim(lat, lng),
    [usarMapbox, token]
  );

  const elegirPunto = useCallback(
    ({ lat, lng, nombre }) => {
      if (!esCoordenadaValida(lat, lng)) return;

      setPunto({ lat, lng });

      const aviso = (texto) => {
        setDireccion(texto);
        onUbicarRef.current?.({ direccion: texto, lat, lng });
      };

      obtenerDireccion(lat, lng)
        .then((texto) => {
          if (texto) aviso(texto);
          else aviso(nombre || `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        })
        .catch(() => {
          aviso(nombre || `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
    },
    [obtenerDireccion]
  );

  useEffect(() => {
    if (!valor || !proveedor) return;

    let cancelado = false;

    const consultar = usarMapbox
      ? buscarEnMapbox(valor, token, 1)
      : buscarEnNominatim(valor, 1);

    consultar
      .then((lugares) => {
        if (cancelado) return;

        const lugar = lugares[0];

        if (!lugar) return;

        elegirPunto({ lat: lugar.lat, lng: lugar.lng, nombre: lugar.name });
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [valor, proveedor, usarMapbox, token, elegirPunto]);

  const redondear = (numero) => Number(numero.toFixed(6));

  const enlaceExterno = punto
    ? usarMapbox
      ? `https://www.mapbox.com/directions/?destination=${redondear(punto.lng)},${redondear(punto.lat)}&profile=driving`
      : `https://www.openstreetmap.org/?mlat=${redondear(punto.lat)}&mlon=${redondear(punto.lng)}#map=17/${redondear(punto.lat)}/${redondear(punto.lng)}`
    : "";

  return (
    <div className="mapa-entrega-contenido">
      {!proveedor && <div className="mapa-puntero mapa-cargando" />}

      {proveedor === "mapbox" && (
        <MapaMapbox
          token={token}
          punto={punto}
          onElegirPunto={elegirPunto}
        />
      )}

      {proveedor === "leaflet" && (
        <MapaLeaflet punto={punto} onElegirPunto={elegirPunto} />
      )}

      <span className="mapa-coordenadas">
        {punto
          ? `${redondear(punto.lat)}, ${redondear(punto.lng)}`
          : "Toca el mapa para marcar tu ubicación"}
      </span>

      {direccion && (
        <span className="mapa-direccion">Dirección: {direccion}</span>
      )}

      {punto && (
        <a
          className="btn-secundario mapa-enlace"
          href={enlaceExterno}
          rel="noreferrer"
          target="_blank"
        >
          {usarMapbox ? "Abrir en Mapbox" : "Abrir en OpenStreetMap"}
        </a>
      )}

      <small>
        Toca el mapa o arrastra el puntero para elegir el punto de entrega. La
        dirección se escribe sola en el formulario.{" "}
        {usarMapbox
          ? "Mapa satelital de Mapbox, limitado a Costa Rica."
          : "Mapa de respaldo con OpenStreetMap, limitado a Costa Rica."}
      </small>
    </div>
  );
}
