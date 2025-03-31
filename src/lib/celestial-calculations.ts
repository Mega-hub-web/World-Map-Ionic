// Simplified calculations for sun and moon positions
// Note: These are approximations for demonstration purposes

export function calculateSunPosition(date: Date) {
  // Get day of year
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  // Calculate declination angle (simplified)
  const declination = -23.45 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10))

  // Calculate longitude based on time of day
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const timeDecimal = hours + minutes / 60
  const longitude = (timeDecimal - 12) * 15

  return {
    latitude: declination,
    longitude: longitude,
  }
}

export function calculateMoonPosition(date: Date) {
  // This is a very simplified approximation
  // In reality, moon position calculation is complex

  // Get day of year
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  // Calculate declination angle (simplified)
  const declination = -18.35 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 40))

  // Calculate longitude based on time of day (offset from sun)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const timeDecimal = hours + minutes / 60
  // Moon rises about 50 minutes later each day
  const moonPhaseOffset = (date.getDate() % 30) * 12 // Simplified lunar phase
  const longitude = (timeDecimal - 12) * 15 + moonPhaseOffset

  return {
    latitude: declination,
    longitude: (longitude % 360) - 180, // Normalize to -180 to 180
  }
}

// Calculate sunrise and sunset times for a location
export function calculateSunriseSunset(date: Date, latitude: number, longitude: number) {
  // Get day of year
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  // Calculate declination angle
  const declination = -23.45 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10))

  // Convert to radians
  const latRad = (latitude * Math.PI) / 180
  const decRad = (declination * Math.PI) / 180

  // Calculate hour angle
  const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad)

  // If cosHourAngle is out of range [-1, 1], there's either no sunrise/sunset or it's always day/night
  if (cosHourAngle < -1) {
    return { sunrise: null, sunset: null, isPolarDay: true }
  } else if (cosHourAngle > 1) {
    return { sunrise: null, sunset: null, isPolarNight: true }
  }

  // Calculate hour angle in degrees
  const hourAngle = (Math.acos(cosHourAngle) * 180) / Math.PI

  // Calculate sunrise and sunset times (in UTC hours)
  const sunriseHour = 12 - hourAngle / 15 - longitude / 15
  const sunsetHour = 12 + hourAngle / 15 - longitude / 15

  // Convert to local time
  const sunriseDate = new Date(date)
  sunriseDate.setUTCHours(Math.floor(sunriseHour))
  sunriseDate.setUTCMinutes(Math.round((sunriseHour % 1) * 60))

  const sunsetDate = new Date(date)
  sunsetDate.setUTCHours(Math.floor(sunsetHour))
  sunsetDate.setUTCMinutes(Math.round((sunsetHour % 1) * 60))

  return { sunrise: sunriseDate, sunset: sunsetDate }
}

