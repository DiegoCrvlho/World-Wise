import styles from "./Map.module.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useCities } from "../Context/CitiesContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../Hooks/useGeolocation";
import Button from "./Button";
import { useGeolocationPosition } from "../Hooks/useGeolocationPosition";

const flagemojiToPNG = (flag) => {
  var countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
    .map((char) => String.fromCharCode(char - 127397).toLowerCase())
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

function Map() {
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]);
  const {
    isLoading: isLoadingPosition,
    position: positionGeolocation,
    getPosition,
  } = useGeolocation();

  const { mapLat, mapLng } = useGeolocationPosition();

  useEffect(
    function () {
      if (positionGeolocation)
        setMapPosition([positionGeolocation.lat, positionGeolocation.lng]);
    },
    [positionGeolocation]
  );

  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );

  return (
    <div className={styles.mapContainer}>
      {!positionGeolocation && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "use location"}
        </Button>
      )}
      <MapContainer
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.mapContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji ? flagemojiToPNG(city.emoji) : ""}</span>{" "}
              <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  });
}

export default Map;
