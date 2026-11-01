import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { formatCategory, getCategoryIcon } from '../../utils/helpers';
import { MapPin, Building, Users, AlertTriangle, Filter, Layers } from 'lucide-react';

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom colored marker icons
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const severityColorMap = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

// Component to dynamically adjust map bounds
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
};

export const InteractiveDisasterMap = ({
  disasters = [],
  shelters = [],
  height = '500px',
  center = [28.6139, 77.209],
  zoom = 12,
  showControls = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showShelters, setShowShelters] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  const categories = [
    'all',
    'flood',
    'fire',
    'earthquake',
    'cyclone',
    'landslide',
    'road_accident',
    'building_collapse',
  ];

  const severities = ['all', 'critical', 'high', 'medium', 'low'];

  const filteredDisasters = disasters.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && d.severity !== selectedSeverity) return false;
    return d.location && d.location.coordinates && d.location.coordinates.length === 2;
  });

  const filteredShelters = shelters.filter(
    (s) => s.location && s.location.coordinates && s.location.coordinates.length === 2
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
      {/* Map Control Toolbar */}
      {showControls && (
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Filter className="w-3.5 h-3.5 text-red-400" /> Filter Incidents:
            </span>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : formatCategory(cat)}
                </option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500"
            >
              {severities.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'all' ? 'All Severities' : `${sev.toUpperCase()} Severity`}
                </option>
              ))}
            </select>
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${showIncidents
                ? 'bg-red-950/80 text-red-300 border-red-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 opacity-60'
                }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Incidents ({filteredDisasters.length})
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${showShelters
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 opacity-60'
                }`}
            >
              <Building className="w-3 h-3 text-emerald-400" />
              Shelters ({filteredShelters.length})
            </button>
          </div>
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <div style={{ height }} className="w-full relative">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <ChangeMapView coords={center} />
          {/* CartoDB Dark Matter tiles for modern sleek aesthetic */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY}`}
          />

          {/* Disaster Markers */}
          {showIncidents &&
            filteredDisasters.map((incident) => {
              const [lng, lat] = incident.location.coordinates;
              const markerColor = severityColorMap[incident.severity] || '#ef4444';
              const icon = createCustomIcon(markerColor, getCategoryIcon(incident.category));

              return (
                <Marker key={incident._id} position={[lat, lng]} icon={icon}>
                  <Popup>
                    <div className="p-1 space-y-2 max-w-xs text-slate-100">
                      {incident.images && incident.images.length > 0 && (
                        <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-slate-800">
                          <img
                            src={incident.images[0]}
                            alt={incident.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <SeverityBadge severity={incident.severity} />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {incident.reportId}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white leading-tight">
                        {incident.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {incident.description}
                      </p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {incident.locationName}
                        </span>
                        {incident.affectedCount > 0 && (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Users className="w-3 h-3" /> {incident.affectedCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Shelter Markers */}
          {showShelters &&
            filteredShelters.map((shelter) => {
              const [lng, lat] = shelter.location.coordinates;
              const isFull = shelter.currentOccupancy >= shelter.totalCapacity;
              const shelterIcon = createCustomIcon(
                isFull ? '#ef4444' : '#10b981',
                '🏕️'
              );

              return (
                <Marker key={shelter._id} position={[lat, lng]} icon={shelterIcon}>
                  <Popup>
                    <div className="p-1 space-y-2 max-w-xs text-slate-100">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFull
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                        >
                          {isFull ? 'FULL CAPACITY' : 'ACTIVE SHELTER'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {shelter.shelterId}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{shelter.name}</h4>
                      <p className="text-xs text-slate-300">{shelter.address}</p>

                      {/* Capacity progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Occupancy:</span>
                          <span className="font-bold">
                            {shelter.currentOccupancy} / {shelter.totalCapacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (shelter.currentOccupancy / shelter.totalCapacity) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p>
                          📞 <strong>Contact:</strong> {shelter.contactPhone}
                        </p>
                        {shelter.facilities && (
                          <p className="text-[10px] text-slate-400">
                            <strong>Facilities:</strong> {shelter.facilities.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};
