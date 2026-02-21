import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapViewProps {
  lat?: number;
  lng?: number;
  label?: string;
  /** Height class, default h-full */
  className?: string;
}

/** Clean teardrop pin in near-black */
const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
  <filter id="shadow" x="-40%" y="-20%" width="180%" height="160%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000040"/>
  </filter>
  <path
    d="M16 0C7.163 0 0 7.163 0 16c0 11 16 32 16 32S32 27 32 16C32 7.163 24.837 0 16 0z"
    fill="#18181b"
    filter="url(#shadow)"
  />
  <circle cx="16" cy="16" r="6" fill="white"/>
</svg>`;

const PIN_ICON = L.divIcon({
  className: '',
  html: PIN_SVG,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -52],
});

/** Tile URL + attribution for CartoDB Positron (clean minimal map) */
const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Default view over the contiguous US */
const DEFAULT_LAT = 39.5;
const DEFAULT_LNG = -98.35;
const DEFAULT_ZOOM = 4;
const PIN_ZOOM = 13;

export function MapView({ lat, lng, label, className = 'h-full' }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Pan / zoom and update pin whenever lat/lng changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (lat !== undefined && lng !== undefined) {
      const marker = L.marker([lat, lng], { icon: PIN_ICON });
      if (label) marker.bindPopup(label);
      marker.addTo(map);
      markerRef.current = marker;
      map.flyTo([lat, lng], PIN_ZOOM, { duration: 1.2 });
    } else {
      map.flyTo([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM, { duration: 1 });
    }
  }, [lat, lng, label]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className} rounded-xl overflow-hidden border border-zinc-200`}
    />
  );
}
