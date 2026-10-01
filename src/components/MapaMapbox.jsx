import { useEffect, useRef } from "react";
import {
  ESTILO_MAPBOX,
  LIMITES_COSTA_RICA,
} from "../utils/geocodificacion";

const CENTRO_INICIAL = { lat: 9.8893, lng: -84.0657 };

const MAX_BOUNDS = [
  [LIMITES_COSTA_RICA.oeste, LIMITES_COSTA_RICA.sur],
  [LIMITES_COSTA_RICA.este, LIMITES_COSTA_RICA.norte],
];

export default function MapaMapbox({ token, punto, onElegirPunto }) {
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
    let cancelado = false;
    let mapa = null;

    const iniciar = async () => {
      const modulo = await import("mapbox-gl");
      await import("mapbox-gl/dist/mapbox-gl.css");

      const mapboxgl = modulo.default || modulo;

      if (cancelado || !contenedorRef.current) return;

      mapboxgl.accessToken = token;

      const inicial = puntoRef.current || CENTRO_INICIAL;

      mapa = new mapboxgl.Map({
        container: contenedorRef.current,
        style: ESTILO_MAPBOX,
        center: [inicial.lng, inicial.lat],
        zoom: 14,
        maxBounds: MAX_BOUNDS,
        renderWorldCopies: false,
        attributionControl: false,
      });

      mapa.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      mapa.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      const marcador = new mapboxgl.Marker({
        color: "#a96447",
        draggable: true,
      })
        .setLngLat([inicial.lng, inicial.lat])
        .addTo(mapa);

      mapaRef.current = mapa;
      marcadorRef.current = marcador;

      mapa.on("click", (evento) => {
        onElegirPuntoRef.current?.({
          lat: evento.lngLat.lat,
          lng: evento.lngLat.lng,
        });
      });

      marcador.on("dragend", () => {
        const posicion = marcador.getLngLat();

        onElegirPuntoRef.current?.({ lat: posicion.lat, lng: posicion.lng });
      });
    };

    iniciar().catch(() => {});

    return () => {
      cancelado = true;

      if (mapa) mapa.remove();

      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const mapa = mapaRef.current;
    const marcador = marcadorRef.current;

    if (!mapa || !marcador || !punto) return;
    if (!Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) return;

    const actual = marcador.getLngLat();

    if (
      Math.abs(actual.lat - punto.lat) < 1e-7 &&
      Math.abs(actual.lng - punto.lng) < 1e-7
    ) {
      return;
    }

    marcador.setLngLat([punto.lng, punto.lat]);
    mapa.flyTo({ center: [punto.lng, punto.lat], essential: false });
  }, [punto]);

  return <div className="mapa-puntero" ref={contenedorRef} />;
}
