"use client";

import { Observer, Equator, Body, Horizon } from "astronomy-engine";

// --- Utilities ---
function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

// --- GMST Calculation ---
function dateToJulian(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function calculateGMST(date: Date) {
  const jd = dateToJulian(date);
  const T = (jd - 2451545.0) / 36525;
  let GMST =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return ((GMST % 360) + 360) % 360;
}

export function getSubsolarPoint(date: Date) {
  const observer = new Observer(0, 0, 0); // Observer at Earth's center
  const sunPos = Equator(Body.Sun, date, observer, true, true); // Get Sun's equatorial position
  const gmst = calculateGMST(date);

  // Reverse the longitude calculation
  const longitude = (sunPos.ra * 15 - gmst + 360) % 360;

  // Normalize longitude to [-180, 180]
  const normalizedLongitude = longitude > 180 ? longitude - 360 : longitude;

  return {
    latitude: sunPos.dec, // Declination (latitude)
    longitude: normalizedLongitude, // Corrected longitude
  };
}

export function getSublunarPoint(date: Date) {
  const observer = new Observer(0, 0, 0); // Observer at Earth's center
  const moonPos = Equator(Body.Moon, date, observer, true, true); // Get Moon's equatorial position
  const gmst = calculateGMST(date);

  // Reverse the longitude calculation
  const longitude = (moonPos.ra * 15 - gmst + 360) % 360;

  // Normalize longitude to [-180, 180]
  const normalizedLongitude = longitude > 180 ? longitude - 360 : longitude;

  return {
    latitude: moonPos.dec, // Declination (latitude)
    longitude: normalizedLongitude, // Corrected longitude
  };
}
// --- Local Sun Position ---
export function calculateSunPosition(
  date: Date,
  latitude: number,
  longitude: number
) {
  const observer = new Observer(latitude, longitude, 0); // Observer at the specified location

  // Get Sun's equatorial position
  const sunEquatorial = Equator(Body.Sun, date, observer, true, true);

  // Convert equatorial coordinates to horizon coordinates
  const sunHorizon = Horizon(
    date,
    observer,
    sunEquatorial.ra, // Right ascension in hours
    sunEquatorial.dec, // Declination in degrees
    "true" // Include atmospheric refraction
  );

  return {
    altitude: radToDeg(sunHorizon.altitude), // Altitude above the horizon
    azimuth: radToDeg(sunHorizon.azimuth), // Azimuth angle
  };
}

// --- Local Moon Position ---
export function calculateMoonPosition(
  date: Date,
  latitude: number,
  longitude: number
) {
  const observer = new Observer(latitude, longitude, 0); // Observer at the given latitude/longitude

  // Get Moon's equatorial position
  const moonEquatorial = Equator(Body.Moon, date, observer, true, true);

  // Convert equatorial coordinates to horizon coordinates
  const moonHorizon = Horizon(
    date,
    observer,
    moonEquatorial.ra, // Right ascension in hours
    moonEquatorial.dec, // Declination in degrees
    "true" // Include atmospheric refraction
  );

  return {
    altitude: radToDeg(moonHorizon.altitude), // Altitude above the horizon
    azimuth: radToDeg(moonHorizon.azimuth), // Azimuth angle
  };
}
