import { useEffect, useRef } from "react";
import { TerminatorSource } from "@vicmartini/mapbox-gl-terminator";
import mapboxgl from "mapbox-gl";

type Props = {
  map: mapboxgl.Map;
  visible: boolean;
  highContrast?: boolean;
};

export const DayNightOverlay: React.FC<Props> = ({ map, visible, highContrast }) => {
  const sourceRef = useRef<TerminatorSource | null>(null);
  const sourceId = "terminator-source";
  const layerId = "terminator-layer";

  useEffect(() => {
    const fetchTileImageBitmap = async (zxy: string): Promise<ImageBitmap> => {
      const accessToken = mapboxgl.accessToken;
      const url = `https://api.mapbox.com/v4/rreusser.black-marble/${zxy}.webp?access_token=${accessToken}`;
      const response = await fetch(url);
      const blob = await response.blob();
      return await createImageBitmap(blob);
    };

    // Initialize source only once
    const terminatorSource = new TerminatorSource({
      date: Date.now(),
      fadeRange: highContrast ? [1, -1] : [2, -2],
      tileSize: 256,
      is2x: window.devicePixelRatio > 1,
      fetchTileImageBitmap,
    });
    sourceRef.current = terminatorSource;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, terminatorSource as any);
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        maxzoom: 8,
        paint: {
          "raster-opacity": visible ? 1 : 0.6,
        },
      });
    }

    // Update every 5 seconds (feel free to set to 1 second)
    const interval = setInterval(() => {
      if (sourceRef.current) {
        sourceRef.current.date = Date.now();
        // Optionally force re-render depending on lib support
        if (typeof (sourceRef.current as any).requestRender === "function") {
          (sourceRef.current as any).requestRender();
        }
      }
    }, 5000); // or 1000 for true real-time

    return () => {
      clearInterval(interval);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, highContrast, visible]);

  return null;
};
