'use client';
import React, { useEffect, useState, useRef } from 'react';
import styles from '@/src/features/auth/styles/auth-shared.module.css';

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  error?: string;
}

/**
 * Selector de ubicación usando OpenStreetMap + Leaflet.
 * Se carga dinámicamente para evitar problemas con SSR de Next.js.
 */
export default function LocationPicker({
  lat,
  lng,
  onLocationChange,
  error,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [address, setAddress] = useState<string>('');

  const defaultCenter = { lat: -17.7833, lng: -63.1821 }; // Santa Cruz, Bolivia

  useEffect(() => {
    // Importar Leaflet dinámicamente (SSR safe)
    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Importar CSS de leaflet
        await import('leaflet/dist/leaflet.css');

        if (!mapRef.current || mapInstanceRef.current) return;

        // Fix para los iconos de Leaflet en webpack/next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const center = lat && lng ? [lat, lng] : [defaultCenter.lat, defaultCenter.lng];
        const map = L.map(mapRef.current).setView(center as [number, number], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Si ya hay coordenadas, poner marker
        if (lat && lng) {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            onLocationChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
          reverseGeocode(lat, lng);
        }

        // Click en mapa para seleccionar ubicación
        map.on('click', (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([clickLat, clickLng]);
          } else {
            markerRef.current = L.marker([clickLat, clickLng], { draggable: true }).addTo(map);
            markerRef.current.on('dragend', () => {
              const pos = markerRef.current.getLatLng();
              onLocationChange(pos.lat, pos.lng);
              reverseGeocode(pos.lat, pos.lng);
            });
          }
          onLocationChange(clickLat, clickLng);
          reverseGeocode(clickLat, clickLng);
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.error('Error cargando el mapa:', err);
        setLoadError(true);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  // Fallback: inputs manuales si el mapa no carga
  if (loadError) {
    return (
      <div className={styles.inputGroup}>
        <label className={styles.label}>Ubicación (manual)</label>
        <p className={styles.helperText}>No se pudo cargar el mapa. Ingresa las coordenadas manualmente.</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            step="any"
            placeholder="Latitud"
            className={styles.input}
            onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, lng || 0)}
            value={lat || ''}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitud"
            className={styles.input}
            onChange={(e) => onLocationChange(lat || 0, parseFloat(e.target.value) || 0)}
            value={lng || ''}
          />
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <label className={styles.label}>
        Selecciona tu ubicación en el mapa <span className={styles.requiredMark}>*</span>
      </label>
      <div
        ref={mapRef}
        className={styles.mapWrapper}
        style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}
      />
      {!isLoaded && (
        <div className={styles.mapLoading}>
          <div className={styles.spinner}></div>
          <span>Cargando mapa...</span>
        </div>
      )}
      {address && (
        <p className={styles.mapAddress}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {address}
        </p>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
