import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

// Custom ISS icon
const issIcon = new L.DivIcon({
  className: 'iss-icon',
  html: `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div class="iss-marker-pulse"></div>
      <div style="font-size:28px;z-index:2;filter:drop-shadow(0 2px 8px rgba(99,102,241,0.6));">🛰️</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// Component to pan map to ISS position
function MapUpdater({ position }) {
  const map = useMap();
  const initialRef = useRef(true);

  useEffect(() => {
    if (position) {
      if (initialRef.current) {
        map.setView(position, 3);
        initialRef.current = false;
      } else {
        map.panTo(position, { animate: true, duration: 1 });
      }
    }
  }, [position, map]);

  return null;
}

export default function ISSMap({ latitude, longitude, positions }) {
  const { isDark } = useTheme();

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const pathCoords = positions.map(p => [p.latitude, p.longitude]);
  const currentPos = [latitude, longitude];

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
      <MapContainer
        center={currentPos}
        zoom={3}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <MapUpdater position={currentPos} />

        {/* ISS Marker */}
        <Marker position={currentPos} icon={issIcon}>
          <Popup>
            <div className="text-sm font-medium">
              <p className="font-bold text-indigo-600">🛰️ ISS Position</p>
              <p>Lat: {latitude.toFixed(4)}</p>
              <p>Lon: {longitude.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>

        {/* Trajectory polyline */}
        {pathCoords.length > 1 && (
          <Polyline
            positions={pathCoords}
            color="#6366f1"
            weight={3}
            opacity={0.7}
            dashArray="8 4"
          />
        )}
      </MapContainer>
    </div>
  );
}
