import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

type Trip = {
  id: number;
  lat: number;
  lng: number;
};

type Props = {
  trips: Trip[];
  onPinClick: (id: number) => void;
};

function GlobeSection({ trips, onPinClick }: Props) {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

    const viewer = new Cesium.Viewer(viewerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    });

    // 🔥 trips 기반으로 핀 찍기
    trips.forEach((trip) => {
      viewer.entities.add({
        id: trip.id.toString(),
        position: Cesium.Cartesian3.fromDegrees(trip.lng, trip.lat),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
      });
    });

    // 🔥 클릭 이벤트
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);

      if (Cesium.defined(picked) && picked.id) {
        const id = Number(picked.id.id);
        onPinClick(id);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.destroy();
    };
  }, [trips, onPinClick]);

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

export default GlobeSection;