// celestial-calculations.ts
"use client";

import SunCalc from "suncalc";

export const calculateSunPosition = (date: Date) => {
  const pos = SunCalc.getPosition(date, 0, 0);
  return {
    latitude: (pos.altitude / Math.PI) * 180,
    longitude: (pos.azimuth / Math.PI) * 180,
  };
};

function dateToJulian(date: Date) {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

export function calculateGMST(date: Date) {
  const julianDate = dateToJulian(date);
  const T = (julianDate - 2451545.0) / 36525;

  let gmst = 6.697374558 + 0.06570982441908 * (julianDate - 2451545.0);
  gmst +=
    1.00273790935 *
    (date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600);

  gmst = gmst % 24;
  if (gmst < 0) gmst += 24;

  return gmst;
}

export function calculateMoonPosition(date: Date) {
  const pos = SunCalc.getMoonPosition(date, 0, 0); // Use correct lat/lng if known
  return {
    latitude: (pos.altitude / Math.PI) * 180,
    longitude: (pos.azimuth / Math.PI) * 180,
  };
}


export function calculateSunriseSunset(
  date: Date,
  latitude: number,
  longitude: number
) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const sunPosition = calculateSunPosition(date);
  const declination = sunPosition.latitude;

  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);

  if (cosHourAngle < -1) {
    return { sunrise: null, sunset: null, isPolarDay: true };
  } else if (cosHourAngle > 1) {
    return { sunrise: null, sunset: null, isPolarNight: true };
  }

  const hourAngle = (Math.acos(cosHourAngle) * 180) / Math.PI;
  const sunriseHour = 12 - hourAngle / 15 - longitude / 15;
  const sunsetHour = 12 + hourAngle / 15 - longitude / 15;

  const sunriseDate = new Date(date);
  sunriseDate.setUTCHours(Math.floor(sunriseHour));
  sunriseDate.setUTCMinutes(Math.round((sunriseHour % 1) * 60));

  const sunsetDate = new Date(date);
  sunsetDate.setUTCHours(Math.floor(sunsetHour));
  sunsetDate.setUTCMinutes(Math.round((sunsetHour % 1) * 60));

  return { sunrise: sunriseDate, sunset: sunsetDate };
}
