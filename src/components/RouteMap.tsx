import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

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
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
          />
        ))}
      </Map>
    </APIProvider>
  );
}