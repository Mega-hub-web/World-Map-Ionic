"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapPin, Plus, Minus, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateSunPosition, calculateMoonPosition, calculateSunriseSunset } from "@/lib/celestial-calculations"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Location {
  name: string
  timezone: string
  lat: number
  lng: number
}

interface WorldMapProps {
  selectedLocation: Location
  onLocationSelect: (location: Location) => void
}

interface PopupPosition {
  x: number
  y: number
  placement: "top" | "bottom" | "left" | "right"
}

export default function WorldMap({ selectedLocation, onLocationSelect }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0 })
  const [moonPosition, setMoonPosition] = useState({ x: 0, y: 0 })
  const [is4KEnabled, setIs4KEnabled] = useState(false)
  const [mapStyle, setMapStyle] = useState("dark")
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<PopupPosition>({ x: 0, y: 0, placement: "top" })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sunriseTime, setSunriseTime] = useState<Date | null>(null)
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)

  // Sample locations
  const locations: Location[] = [
    { name: "New York", timezone: "America/New_York", lat: 40.71, lng: -74.01 },
    { name: "London", timezone: "Europe/London", lat: 51.51, lng: -0.13 },
    { name: "Paris", timezone: "Europe/Paris", lat: 48.85, lng: 2.35 },
    { name: "Tokyo", timezone: "Asia/Tokyo", lat: 35.68, lng: 139.76 },
    { name: "Sydney", timezone: "Australia/Sydney", lat: -33.87, lng: 151.21 },
    { name: "Rio de Janeiro", timezone: "America/Sao_Paulo", lat: -22.91, lng: -43.17 },
    { name: "Cairo", timezone: "Africa/Cairo", lat: 30.05, lng: 31.23 },
    { name: "Dubai", timezone: "Asia/Dubai", lat: 25.2, lng: 55.27 },
  ]

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Initialize map dimensions and set up event listeners
  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect()
        setMapDimensions({ width, height })
        setIsMobile(window.innerWidth < 768)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Check if device supports 4K
    const mediaQuery = window.matchMedia("(min-resolution: 192dpi), (min-resolution: 2dppx)")
    setIs4KEnabled(mediaQuery.matches)

    // Setup fullscreen change event
    document.addEventListener("fullscreenchange", () => {
      setIsFullscreen(!!document.fullscreenElement)
    })

    return () => {
      window.removeEventListener("resize", updateDimensions)
      document.removeEventListener("fullscreenchange", () => { })
    }
  }, [])

  // Update sun and moon positions
  useEffect(() => {
    const updateCelestialPositions = () => {
      const now = new Date()

      // Calculate sun position
      const sunPos = calculateSunPosition(now)
      const sunX = (sunPos.longitude + 180) * (mapDimensions.width / 360)
      const sunY = (90 - sunPos.latitude) * (mapDimensions.height / 180)
      setSunPosition({ x: sunX, y: sunY })

      // Calculate moon position
      const moonPos = calculateMoonPosition(now)
      const moonX = (moonPos.longitude + 180) * (mapDimensions.width / 360)
      const moonY = (90 - moonPos.latitude) * (mapDimensions.height / 180)
      setMoonPosition({ x: moonX, y: moonY })

      // Calculate sunrise/sunset for selected location
      const sunTimes = calculateSunriseSunset(now, selectedLocation.lat, selectedLocation.lng)
      setSunriseTime(sunTimes.sunrise)
      setSunsetTime(sunTimes.sunset)

      // Render day/night shading
      renderDayNightShading(sunPos.longitude, sunPos.latitude)
    }

    if (mapDimensions.width > 0 && mapDimensions.height > 0) {
      updateCelestialPositions()
      const interval = setInterval(updateCelestialPositions, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [mapDimensions, selectedLocation])

  // Render day/night shading on canvas
  const renderDayNightShading = (sunLongitude: number, sunLatitude: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Set canvas dimensions to match map
    canvas.width = mapDimensions.width
    canvas.height = mapDimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create gradient for night shading
    const gradient = ctx.createRadialGradient(
      (sunLongitude + 180) * (canvas.width / 360),
      (90 - sunLatitude) * (canvas.height / 180),
      0,
      (sunLongitude + 180) * (canvas.width / 360),
      (90 - sunLatitude) * (canvas.height / 180),
      canvas.width / 1.5,
    )

    gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)")
    gradient.addColorStop(1, "rgba(0, 0, 30, 0.7)")

    // Fill with gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add terminator line (day/night boundary)
    ctx.beginPath()

    for (let lat = -90; lat <= 90; lat += 1) {
      const lng = calculateTerminatorLongitude(lat, sunLatitude, sunLongitude)
      const x = (lng + 180) * (canvas.width / 360)
      const y = (90 - lat) * (canvas.height / 180)

      if (lat === -90) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    // Create gradient for terminator line
    const lineGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    lineGradient.addColorStop(0, "rgba(255, 165, 0, 0.7)")
    lineGradient.addColorStop(0.5, "rgba(255, 140, 0, 0.7)")
    lineGradient.addColorStop(1, "rgba(255, 100, 0, 0.7)")

    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 2
    ctx.stroke()

    // Add glow effect to terminator line
    ctx.shadowColor = "rgba(255, 165, 0, 0.5)"
    ctx.shadowBlur = 10
    ctx.stroke()

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
  }

  // Calculate terminator longitude for a given latitude
  const calculateTerminatorLongitude = (lat: number, sunLat: number, sunLng: number) => {
    // Convert to radians
    const latRad = (lat * Math.PI) / 180
    const sunLatRad = (sunLat * Math.PI) / 180

    // Calculate terminator longitude
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(sunLatRad))
    let lng = (sunLng * Math.PI) / 180 + hourAngle

    // Convert back to degrees and normalize to -180 to 180
    lng = ((lng * 180) / Math.PI) % 360
    if (lng > 180) lng -= 360

    return lng
  }

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      if (direction === "in" && prev < 3) return prev + 0.2
      if (direction === "out" && prev > 0.5) return prev - 0.2
      return prev
    })
  }

  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Convert lat/lng to x/y coordinates on the map
  const getCoordinates = (lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 }

    const width = mapRef.current.clientWidth
    const height = mapRef.current.clientHeight

    // Simple conversion (not accurate for a real map, but works for demo)
    const x = (lng + 180) * (width / 360)
    const y = (90 - lat) * (height / 180)

    return { x, y }
  }

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate optimal popover position to ensure it's visible
  const calculatePopoverPosition = (x: number, y: number): PopupPosition => {
    if (!mapRef.current) return { x, y, placement: "top" };

    const POPOVER_WIDTH = 200;
    const POPOVER_HEIGHT = 120;
    const OFFSET = 15;
    const PADDING = 10;

    const mapRect = mapRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default placement
    let placement: "top" | "bottom" | "left" | "right" = "top";
    let posX = x;
    let posY = y - OFFSET;

    // Adjust placement based on viewport boundaries
    if (x < POPOVER_WIDTH / 2 + PADDING) {
      placement = "right";
      posX = x + OFFSET;
      posY = y;
    } else if (x > viewportWidth - POPOVER_WIDTH / 2 - PADDING) {
      placement = "left";
      posX = x - OFFSET;
      posY = y;
    } else if (y < POPOVER_HEIGHT + OFFSET + PADDING) {
      placement = "bottom";
      posY = y + OFFSET;
    } else if (y > viewportHeight - POPOVER_HEIGHT - OFFSET - PADDING) {
      placement = "top";
      posY = y - OFFSET;
    }

    // Ensure the popover stays within the viewport horizontally
    posX = Math.max(
      PADDING,
      Math.min(posX, viewportWidth - POPOVER_WIDTH - PADDING)
    );

    // Ensure the popover stays within the viewport vertically
    posY = Math.max(
      PADDING,
      Math.min(posY, viewportHeight - POPOVER_HEIGHT - PADDING)
    );

    return { x: posX, y: posY, placement };
  };

  // Handle location hover
  const handleLocationHover = (location: Location, x: number, y: number) => {
    // Calculate optimal popover position
    const position = calculatePopoverPosition(x, y)
    setPopoverPosition(position)
    setHoveredLocation(location)
  }

  // Handle location selection (click)
  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location)
  }

  const getPopoverTransform = (placement: "top" | "bottom" | "left" | "right"): string => {
    switch (placement) {
      case "top":
        return "translate(-50%, -100%)"
      case "bottom":
        return "translate(-50%, 0)"
      case "left":
        return "translate(-100%, -50%)"
      case "right":
        return "translate(0, -50%)"
      default:
        return "translate(-50%, -100%)"
    }
  }

  const getPopoverArrow = (placement: "top" | "bottom" | "left" | "right"): React.JSX.Element => {
    switch (placement) {
      case "top":
        return (
          <div className="absolute left-1/2 bottom-0 w-0 h-0 -mb-2 border-l-6 border-r-6 border-t-6 border-transparent border-t-indigo-950/95 -translate-x-1/2" />
        )
      case "bottom":
        return (
          <div className="absolute left-1/2 top-0 w-0 h-0 -mt-2 border-l-6 border-r-6 border-b-6 border-transparent border-b-indigo-950/95 -translate-x-1/2" />
        )
      case "left":
        return (
          <div className="absolute top-1/2 right-0 w-0 h-0 -mr-2 border-t-6 border-b-6 border-l-6 border-transparent border-l-indigo-950/95 -translate-y-1/2" />
        )
      case "right":
        return (
          <div className="absolute top-1/2 left-0 w-0 h-0 -ml-2 border-t-6 border-b-6 border-r-6 border-transparent border-r-indigo-950/95 -translate-y-1/2" />
        )
      default:
        return (
          <div className="absolute left-1/2 bottom-0 w-0 h-0 -mb-2 border-l-6 border-r-6 border-t-6 border-transparent border-t-indigo-950/95 -translate-x-1/2" />
        )
    }
  }

  const getTimezoneOffset = (timezone: string): string => {
    const now = new Date()
    const tzOffset = new Date().toLocaleString("en-US", { timeZone: timezone, timeZoneName: "short" }).split(" ").pop()
    return tzOffset?.replace("GMT", "") || ""
  }

  return (
    <TooltipProvider>
      <div className="relative w-full h-full overflow-hidden bg-gray-900">
        {/* Map controls */}
        <div className="absolute top-4 left-4 z-20 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom("in")}
                className="text-white hover:bg-gray-700 border-b border-gray-700/50"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom("out")}
                className="text-white hover:bg-gray-700"
              >
                <Minus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Time indicator */}
        <div className="absolute bottom-8 right-8 z-20 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3">
          <div className="text-center">
            <div className="text-xs text-gray-400">Your Current Time</div>
            <div className="text-2xl font-bold text-white">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        </div>

        {/* Map container */}
        <div
          ref={mapRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Map image with filter based on style */}
          <div
            className={`absolute w-full h-full bg-cover bg-center transition-filter duration-500 ${mapStyle === "dark"
                ? "map-dark"
                : mapStyle === "satellite"
                  ? "map-satellite"
                  : mapStyle === "political"
                    ? "map-political"
                    : mapStyle === "topographic"
                      ? "map-topographic"
                      : ""
              }`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.3s ease",
            }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-24 grid-rows-12 pointer-events-none opacity-20">
              {Array.from({ length: 24 * 12 }).map((_, index) => (
                <div key={index} className="border border-blue-500/10"></div>
              ))}
            </div>

            {/* Day/Night shading canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.3s ease",
              }}
            />

            {/* Sun position */}
            <div
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: sunPosition.x,
                top: sunPosition.y,
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) translate(-50%, -50%)`,
              }}
            >
              <div className="relative">
                <Sun className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-yellow-500/30 animate-pulse" />
                <div className="absolute -top-2 -right-2 -left-2 -bottom-2 rounded-full bg-yellow-500/20" />
                <div className="absolute -top-4 -right-4 -left-4 -bottom-4 rounded-full bg-yellow-500/10" />
                <div className="absolute -top-8 -right-8 -left-8 -bottom-8 rounded-full bg-yellow-500/5 animate-pulse-glow" />
              </div>
            </div>

            {/* Moon position */}
            <div
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: moonPosition.x,
                top: moonPosition.y,
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) translate(-50%, -50%)`,
              }}
            >
              <div className="relative">
                <Moon className="h-7 w-7 text-gray-200 fill-gray-200" />
                <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-blue-100/20 animate-pulse" />
                <div className="absolute -top-2 -right-2 -left-2 -bottom-2 rounded-full bg-blue-100/10" />
                <div className="absolute -top-4 -right-4 -left-4 -bottom-4 rounded-full bg-blue-100/5 animate-pulse-glow" />
              </div>
            </div>

            {/* Location markers */}
            {locations.map((location) => {
              const coords = getCoordinates(location.lat, location.lng)
              return (
                <button
                  key={location.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{
                    left: coords.x,
                    top: coords.y,
                  }}
                  onClick={() => handleLocationSelect(location)}
                  onMouseEnter={() => handleLocationHover(location, coords.x, coords.y)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  <div className="relative">
                    <MapPin
                      className={`h-8 w-8 ${selectedLocation.name === location.name
                          ? "text-pink-500 fill-pink-500"
                          : "text-pink-500 group-hover:text-pink-400"
                        }`}
                    />
                    <div
                      className={`absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full ${selectedLocation.name === location.name
                          ? "bg-pink-500/30 animate-pulse"
                          : "bg-transparent group-hover:bg-pink-500/20"
                        }`}
                    />
                    {selectedLocation.name === location.name && (
                      <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-pink-500/20 animate-ping" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Location info popover - Hover-based */}
        <AnimatePresence>
          {hoveredLocation && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 pointer-events-none"
              style={{
                left: popoverPosition.x + 20,
                top: popoverPosition.y + 30,
                transform: getPopoverTransform(popoverPosition.placement),
                width: "115px",
              }}
            >
              {/* Popover arrow */}
              {getPopoverArrow(popoverPosition.placement)}

              <div className="bg-gradient-to-br from-indigo-950/95 to-purple-900/95 backdrop-blur-md text-white rounded-lg border border-indigo-500/30 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2 border-b border-indigo-500/20 bg-indigo-900/30">
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                    {hoveredLocation.name}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-3 bg-indigo-950/20">
                  <div className="text-base font-medium text-white mb-1">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: hoveredLocation.timezone,
                    })}
                  </div>
                  <div className="text-xs text-indigo-200 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                    {new Date().toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: hoveredLocation.timezone,
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
