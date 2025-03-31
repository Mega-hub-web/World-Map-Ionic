"use client"

import { useState, useEffect } from "react"
import { UserPlus, Menu, MapPin, Clock, Search } from "lucide-react"
import WorldMap from "@/components/world-map"
import TimeDisplay from "@/components/time-display"
import CityTimeDisplay from "@/components/city-time-display"
import LoginModal from "@/components/login-modal"
import MapControls from "@/components/map-controls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [selectedLocation, setSelectedLocation] = useState({
    name: "London",
    timezone: "Europe/London",
    lat: 51.51,
    lng: -0.13,
  })

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  // Get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Cities for the time display
  const cities = [
    { name: "New York", timezone: "America/New_York" },
    { name: "London", timezone: "Europe/London" },
    { name: "Paris", timezone: "Europe/Paris" },
    { name: "Beijing", timezone: "Asia/Shanghai" },
    { name: "Tokyo", timezone: "Asia/Tokyo" },
    { name: "Rio", timezone: "America/Sao_Paulo" },
  ]

  // Header cities
  const headerCities = [
    { name: "UTC", timezone: "UTC" },
    { name: "London", timezone: "Europe/London" },
    { name: "Hong Kong", timezone: "Asia/Hong_Kong" },
    { name: "Delhi", timezone: "Asia/Kolkata" },
    { name: "New York", timezone: "America/New_York" },
    { name: "Rio", timezone: "America/Sao_Paulo" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {activeTab === "home" ? (
        // Home page with large clock
        <div className="flex flex-col items-center justify-center flex-grow p-4">
          <div className="absolute top-4 right-4 flex gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("map")}
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-gray-200"
            >
              View Map
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogin(true)}
              aria-label="User account"
              className="bg-gray-800/50 border border-gray-700 hover:bg-gray-800 text-gray-200"
            >
              <UserPlus className="h-7 w-7 !important" />
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 mb-12"
          >
            <TimeDisplay
              date={currentTime}
              // className="text-[8rem] sm:text-[10rem] md:text-[15rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-none tracking-tight"
              className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-none tracking-tight"

           />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-2xl sm:text-3xl text-gray-300 font-light">
              {formatDate(currentTime)}, week {getWeekNumber(currentTime)}
            </p>
            <p className="text-xl sm:text-2xl text-purple-400 mt-2 font-medium">
              Celebration of the Greek Revolution / Waffle Day
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full max-w-5xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 overflow-auto">
              {cities.map((city, index) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-800/80 transition-colors"
                >
                  <h3 className="text-xl font-medium text-gray-200">{city.name}</h3>
                  <CityTimeDisplay
                    timezone={city.timezone}
                    className="text-2xl sm:text-3xl text-white font-bold mt-1"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12"
          >
            <Button
              onClick={() => setActiveTab("map")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 rounded-full text-lg font-medium"
            >
              Explore World Map
            </Button>
          </motion.div>
        </div>
      ) : (
        // Map view
        <div className="flex flex-col h-screen">
          {/* Header with clocks */}
          <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-2 flex items-center overflow-x-auto shadow-lg z-10">
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-white mr-2 hover:bg-white/10"
              onClick={() => setActiveTab("home")}
            >
              <Menu className="h-5 w-5" />
            </Button> */}

            <div className="ml-auto flex space-x-1 overflow-x-auto">
              {headerCities.map((city) => (
                <div key={city.name} className="flex-shrink-0 border-r border-indigo-700/30 last:border-r-0 px-4 py-1">
                  <div className="flex items-center mb-1 justify-center">
                    {city.name === "UTC" ? (
                      <Clock className="h-4 w-4 mr-2 text-indigo-300" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2 text-pink-300" />
                    )}
                    <span className="text-gray-300 text-sm">{city.name}</span>
                  </div>
                  <CityTimeDisplay timezone={city.timezone} className="text-2xl font-bold" showSeconds={true} />
                  {city.name !== "UTC" && <div className="text-xs mt-1 text-gray-300">Tue, 25 Mar 2025</div>}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <span className="text-gray-300 text-sm">{city.name}</span>
                <Input
                  type="text"
                  placeholder="Search location..."
                  className="w-48 pl-9 h-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/30"
                />
              </div> */}
              {/* <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowLogin(true)}
              >
                <UserPlus className="h-5 w-5" />
              </Button> */}
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-grow relative">
            <WorldMap selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />

            <MapControls />

            {/* Location info popup */}
            {/* {selectedLocation && (
              <div className="absolute top-20 left-10 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg border border-gray-700/50 shadow-xl">
                <h3 className="text-xl text-gradient-purple font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                  {selectedLocation.name}
                </h3>
                <p className="text-gray-300">Timezone: {selectedLocation.timezone}</p>
                <p className="text-gray-300">
                  Lat: {selectedLocation.lat}, Lng: {selectedLocation.lng}
                </p>
              </div>
            )} */}
          </div>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}

