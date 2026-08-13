import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglo necesario: Leaflet + Vite no cargan bien los íconos por defecto sin esto
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Coordenadas de Tizayuca, Hidalgo (ajusta a la dirección exacta del mercado cuando la tengas)
const UBICACION_INICIAL = { lat: 19.8347, lng: -98.9803 };
const NOMBRE_MERCADO = "Mercado Municipal Tizayuca";

// Componente interno: mueve el mapa a una nueva posición cuando cambian las coordenadas
function RecentrarMapa({ posicion }) {
  const map = useMap();
  map.setView(posicion, 16);
  return null;
}

export default function MapaMercado({ height = '320px' }) {
  const [posicion, setPosicion] = useState(UBICACION_INICIAL);
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);

  // Geocodificación con Nominatim (API REST oficial de OpenStreetMap) — convierte texto a coordenadas
  async function buscarDireccion(e) {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setBuscando(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}`
      );
      const data = await res.json();

      if (data.length === 0) {
        alert("No se encontró esa dirección");
        return;
      }

      setPosicion({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } catch (err) {
      console.error(err);
      alert("Error al buscar la dirección");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={buscarDireccion} style={{ display: 'flex', gap: '8px', marginBottom: '10px', padding: '0 4px' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar una dirección..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: '8px',
            border: '1.5px solid #ddd', fontSize: '13px', fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={buscando}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: '#1E5B2E', color: '#fff', fontSize: '13px', cursor: 'pointer',
          }}
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <div style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer center={posicion} zoom={16} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={posicion}>
            <Popup>
              <strong>{NOMBRE_MERCADO}</strong>
            </Popup>
          </Marker>
          <RecentrarMapa posicion={posicion} />
        </MapContainer>
      </div>
    </div>
  );
}