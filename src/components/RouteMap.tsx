import { useEffect } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";

type Place = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

type RouteMapProps = {
  center: { lat: number; lng: number };
  places: Place[];
};

function RoutePolyline({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google) return;

    const path = places
      .filter(
        (place) =>
          typeof place.lat === "number" &&
          typeof place.lng === "number"
      )
      .map((place) => ({
        lat: place.lat,
        lng: place.lng,
      }));

    if (path.length < 2) return;

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,

      strokeColor: "#3B82F6",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      strokeLineCap: "round",
      strokeLineJoin: "round",

      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, places]);

  return null;
}

export default function RouteMap({ center, places }: RouteMapProps) {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI={true}
        style={{ width: "100%", height: "100%" }}
      >
        {places.map((place, index) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            label={{
              text: String(index + 1),
              color: "white",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          />
        ))}

        <RoutePolyline places={places} />
      </Map>
    </APIProvider>
  );
}