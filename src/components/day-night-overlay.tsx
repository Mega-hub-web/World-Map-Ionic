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
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) {
      console.error("Map instance is not available.");
      return;
    }

    const fetchTileImageBitmap = async (zxy: string): Promise<ImageBitmap> => {
      const accessToken = mapboxgl.accessToken;
      const url = `https://api.mapbox.com/v4/rreusser.black-marble/${zxy}.webp?access_token=${accessToken}`;

      try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Tile failed: ${zxy}`);

        const blob = await response.blob();
        return await createImageBitmap(blob);
      } catch (err) {
        console.warn(`Fallback tile used for: ${zxy}`, err);

        // Transparent fallback tile
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, 256, 256);
        return await createImageBitmap(canvas);
      }
    };

    // Initialize the TerminatorSource
    const terminatorSource = new TerminatorSource({
      date: Date.now(),
      fadeRange: highContrast ? [1, -1] : [2, -2],
      tileSize: 256,
      is2x: false,
      fetchTileImageBitmap,
    });

    sourceRef.current = terminatorSource;

    // Add the source to the map
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, terminatorSource as any);
    }

    // Add the layer to the map
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        maxzoom: 8,
        paint: {
          "raster-opacity": visible ? 0.9 : 0.8,
        },
      });
    }

    // Update the source using requestAnimationFrame
    const updateSource = () => {
      if (sourceRef.current) {
        sourceRef.current.date = Date.now();
        if (typeof (sourceRef.current as any).requestRender === "function") {
          (sourceRef.current as any).requestRender();
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateSource);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateSource);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }

      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, highContrast, visible]);

  return null;
};