import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MapPin } from 'lucide-react';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

export const LocationPickerModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialCoords = [28.6139, 77.209],
}) => {
  const [selectedCoords, setSelectedCoords] = useState(initialCoords);

  const handleConfirm = () => {
    if (selectedCoords && selectedCoords.length === 2) {
      onSelectLocation({
        latitude: selectedCoords[0],
        longitude: selectedCoords[1],
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Incident Location on Map" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-300">
          Click anywhere on the map to drop an incident location pin. The coordinates will be automatically recorded.
        </p>

        <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-700 relative">
          <MapContainer
            center={selectedCoords}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY}`}
            />
            <LocationMarker
              position={selectedCoords}
              setPosition={setSelectedCoords}
            />
          </MapContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Lat: {selectedCoords[0]?.toFixed(5)}</span>
            <span>Lng: {selectedCoords[1]?.toFixed(5)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirm}>
              Confirm Location
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
