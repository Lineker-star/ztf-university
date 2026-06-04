'use client';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

export default function BertoaMap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      const mapContainer = document.getElementById('bertoua-map');
      if (!mapContainer || (mapContainer as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      const map = L.map('bertoua-map').setView([4.5833, 13.6833], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon using university colors
      const customIcon = L.divIcon({
        html: `<div style="background:#0A1628;color:#C9A84C;padding:8px 12px;border-radius:8px;font-weight:bold;font-size:11px;border:2px solid #C9A84C;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.3);">🎓 ZTF-UI</div>`,
        className: '',
        iconAnchor: [30, 20],
      });

      const marker = L.marker([4.5833, 13.6833], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:Arial;padding:8px;">
          <strong style="color:#0A1628;">ZTF University Institute</strong><br/>
          <span style="color:#C9A84C;font-size:12px;">Institut Universitaire ZTF (IU-ZTF)</span><br/>
          <span style="font-size:12px;">Koumé – Bertoua, East Region, Cameroon</span>
        </div>
      `).openPopup();
    });
  }, []);

  return (
    <div id="bertoua-map" style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: '1rem' }} />
  );
}
