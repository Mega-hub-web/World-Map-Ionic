"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  MapPin,
  Plus,
  Minus,
  Sun,
  Moon,
  Layers,
  Compass,
  Search,
  Info,
  Clock,
  MapIcon,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateSunPosition, calculateMoonPosition, calculateSunriseSunset } from "@/lib/celestial-calculations"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

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

export default function WorldMap({ selectedLocation, onLocationSelect }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0 })
  const [moonPosition, setMoonPosition] = useState({ x: 0, y: 0 })
  const [is4KEnabled, setIs4KEnabled] = useState(false)
  const [mapStyle, setMapStyle] = useState("dark")
  const [showMapStyleSelector, setShowMapStyleSelector] = useState(false)
  const [showLocationInfo, setShowLocationInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sunriseTime, setSunriseTime] = useState<Date | null>(null)
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

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

  // Map styles
  const mapStyles = [
    { id: "dark", name: "Dark", color: "bg-gray-900" },
    { id: "satellite", name: "Satellite", color: "bg-blue-900" },
    { id: "political", name: "Political", color: "bg-indigo-900" },
    { id: "topographic", name: "Topographic", color: "bg-green-900" },
  ]

  // Time zones data - simplified for demonstration
  const timeZones = [
    // { name: "UTC-12", offset: -12, color: "rgba(20, 20, 80, 0.2)" },
    // { name: "UTC-11", offset: -11, color: "rgba(30, 30, 90, 0.2)" },
    // { name: "UTC-10", offset: -10, color: "rgba(40, 40, 100, 0.2)" },
    // { name: "UTC-9", offset: -9, color: "rgba(50, 50, 110, 0.2)" },
    // { name: "UTC-8", offset: -8, color: "rgba(60, 60, 120, 0.2)" },
    // { name: "UTC-7", offset: -7, color: "rgba(70, 70, 130, 0.2)" },
    // { name: "UTC-6", offset: -6, color: "rgba(80, 80, 140, 0.2)" },
    // { name: "UTC-5", offset: -5, color: "rgba(90, 90, 150, 0.2)" },
    // { name: "UTC-4", offset: -4, color: "rgba(100, 100, 160, 0.2)" },
    // { name: "UTC-3", offset: -3, color: "rgba(110, 110, 170, 0.2)" },
    // { name: "UTC-2", offset: -2, color: "rgba(120, 120, 180, 0.2)" },
    // { name: "UTC-1", offset: -1, color: "rgba(130, 130, 190, 0.2)" },
    // { name: "UTC", offset: 0, color: "rgba(140, 140, 200, 0.2)" },
    // { name: "UTC+1", offset: 1, color: "rgba(130, 130, 190, 0.2)" },
    // { name: "UTC+2", offset: 2, color: "rgba(120, 120, 180, 0.2)" },
    // { name: "UTC+3", offset: 3, color: "rgba(110, 110, 170, 0.2)" },
    // { name: "UTC+4", offset: 4, color: "rgba(100, 100, 160, 0.2)" },
    // { name: "UTC+5", offset: 5, color: "rgba(90, 90, 150, 0.2)" },
    // { name: "UTC+6", offset: 6, color: "rgba(80, 80, 140, 0.2)" },
    // { name: "UTC+7", offset: 7, color: "rgba(70, 70, 130, 0.2)" },
    // { name: "UTC+8", offset: 8, color: "rgba(60, 60, 120, 0.2)" },
    // { name: "UTC+9", offset: 9, color: "rgba(50, 50, 110, 0.2)" },
    // { name: "UTC+10", offset: 10, color: "rgba(40, 40, 100, 0.2)" },
    // { name: "UTC+11", offset: 11, color: "rgba(30, 30, 90, 0.2)" },
    // { name: "UTC+12", offset: 12, color: "rgba(20, 20, 80, 0.2)" },
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
      document.removeEventListener("fullscreenchange", () => {})
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

  // Toggle 4K resolution
  const toggle4K = () => {
    setIs4KEnabled((prev) => !prev)
  }

  // Toggle map style selector
  const toggleMapStyleSelector = () => {
    setShowMapStyleSelector((prev) => !prev)
  }

  // Change map style
  const changeMapStyle = (style: string) => {
    setMapStyle(style)
    setShowMapStyleSelector(false)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (mapRef.current?.requestFullscreen) {
        mapRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) => searchQuery === "" || location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

        {/* Map style selector */}
        {/* <div className="absolute top-4 left-20 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMapStyleSelector}
                className="bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                <span>Map Style</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change map appearance</p>
            </TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {showMapStyleSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 left-0 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-2 w-40 z-30"
              >
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => changeMapStyle(style.id)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm ${
                      mapStyle === style.id ? "bg-indigo-600 text-white" : "text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${style.color}`} />
                    {style.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* Search button */}
        {/* <div className="absolute top-4 right-24 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSearch((prev) => !prev)}
                className={`bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white hover:bg-gray-700 ${
                  showSearch ? "bg-indigo-600 border-indigo-500" : ""
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Search locations</p>
            </TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 250 }}
                exit={{ opacity: 0, width: 0 }}
                className="absolute top-0 right-12 overflow-hidden"
              >
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3">
                  <Input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    autoFocus
                  />

                  {searchQuery && (
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location) => (
                          <button
                            key={location.name}
                            onClick={() => {
                              onLocationSelect(location)
                              setSearchQuery("")
                              setShowSearch(false)
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-gray-700"
                          >
                            <MapPin className="h-4 w-4 text-pink-500" />
                            {location.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 p-2">No locations found</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* 4K toggle */}
        {/* <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white hover:bg-gray-700"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggle4K}
                className={`${
                  is4KEnabled
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white hover:bg-gray-700"
                }`}
              >
                {is4KEnabled ? "4K Enabled" : "4K Display"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle high-resolution map</p>
            </TooltipContent>
          </Tooltip>
        </div> */}

        {/* Compass */}
        {/* <div className="absolute bottom-8  z-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-full shadow-lg"></div>
            <Compass className="absolute inset-0 m-auto h-10 w-10 text-white" />
          </div>
        </div> */}

        {/* Time indicator */}
        <div className="absolute bottom-8 right-8 z-20 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3">
          <div className="text-center">
            <div className="text-xs text-gray-400">Current Time (UTC)</div>
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
            className={`absolute w-full h-full bg-cover bg-center transition-filter duration-500 ${
              mapStyle === "dark"
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
              // backgroundImage: "url('/map-dark.png')",
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.3s ease",
              // imageRendering: is4KEnabled ? "high-quality" : "auto",
            }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-24 grid-rows-12 pointer-events-none opacity-20">
              {Array.from({ length: 24 * 12 }).map((_, index) => (
                <div key={index} className="border border-blue-500/10"></div>
              ))}
            </div>

            {/* Time zone overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {timeZones.map((zone, index) => {
                const zoneWidth = mapDimensions.width / timeZones.length
                const left = index * zoneWidth + position.x

                return (
                  <div
                    key={zone.name}
                    className="absolute h-full border-l border-blue-500/30 flex items-start justify-center"
                    style={{
                      left: `${(index * 100) / timeZones.length}%`,
                      width: `${100 / timeZones.length}%`,
                      backgroundColor: zone.color,
                    }}
                  >
                    <div className="bg-indigo-900/80 text-white text-xs px-2 py-1 mt-2 rounded-full shadow-lg backdrop-blur-sm border border-indigo-800/50">
                      {zone.name}
                    </div>
                  </div>
                )
              })}
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
                  onClick={() => {
                    onLocationSelect(location)
                    setShowLocationInfo(true)
                  }}
                >
                  <div className="relative">
                    <MapPin
                      className={`h-8 w-8 ${
                        selectedLocation.name === location.name
                          ? "text-pink-500 fill-pink-500"
                          : "text-pink-500 group-hover:text-pink-400"
                      }`}
                    />
                    <div
                      className={`absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full ${
                        selectedLocation.name === location.name
                          ? "bg-pink-500/30 animate-pulse"
                          : "bg-transparent group-hover:bg-pink-500/20"
                      }`}
                    />
                    {selectedLocation.name === location.name && (
                      <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-pink-500/20 animate-ping" />
                    )}
                  </div>
                  <div
                    className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedLocation.name === location.name ? "opacity-100" : ""
                    }`}
                  >
                    {location.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Location info popup */}
        <AnimatePresence>
          {showLocationInfo && selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-20 left-10 bg-gray-900/90 backdrop-blur-md text-white p-5 rounded-lg border border-gray-700/50 shadow-xl z-30 max-w-xs overflow-auto"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                  {selectedLocation.name}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white -mt-1 -mr-1"
                  onClick={() => setShowLocationInfo(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span className="text-gray-300">Timezone: {selectedLocation.timezone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-indigo-400" />
                  <span className="text-gray-300">
                    Coordinates: {selectedLocation.lat.toFixed(2)}, {selectedLocation.lng.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-gray-800/50 rounded-md p-2">
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Sun className="h-3 w-3" />
                      <span>Sunrise</span>
                    </div>
                    <p className="text-white font-medium">{formatTime(sunriseTime)}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-md p-2">
                    <div className="flex items-center gap-1 text-xs text-indigo-400">
                      <Moon className="h-3 w-3" />
                      <span>Sunset</span>
                    </div>
                    <p className="text-white font-medium">{formatTime(sunsetTime)}</p>
                  </div>
                </div>

                <div className="bg-indigo-900/30 rounded-md p-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-indigo-300">
                    <Info className="h-3 w-3" />
                    <span>Local Time</span>
                  </div>
                  <div className="text-white font-bold text-lg">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: selectedLocation.timezone,
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date().toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: selectedLocation.timezone,
                    })}
                  </div>
                </div>
              </div>

                <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 px-2"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Add to Favorites
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 px-2"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    More Details
                  </Button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

