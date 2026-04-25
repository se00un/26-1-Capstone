import { useEffect, useRef } from "react";
import * as Cesium from "cesium";

function GlobePage() {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

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

    // 한국 위치에 점
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(127.0, 37.5),
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
      },
    });

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(127, 37.5, 20000000),
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  return <div ref={viewerRef} style={{ width: "100vw", height: "100vh" }} />;
}

export default GlobePage;