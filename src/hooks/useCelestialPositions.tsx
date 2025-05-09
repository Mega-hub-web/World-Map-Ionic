// hooks/useCelestialPositions.ts
"use client";

import { useEffect, useState } from "react";
import {
  calculateSunPosition,
  calculateMoonPosition,
} from "../lib/celestial-calculations";

export function useCelestialPositions(interval = 1000) {
  const [positions, setPositions] = useState({
    sun: { latitude: 0, longitude: 0 },
    moon: { latitude: 0, longitude: 0 },
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const sun = calculateSunPosition(now);
      const moon = calculateMoonPosition(now);
      setPositions({ sun, moon });
    };

    update();
    const id = setInterval(update, interval);
    return () => clearInterval(id);
  }, [interval]);

  return positions;
}
