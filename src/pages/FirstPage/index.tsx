"use client"

import { useState, useEffect } from "react"
import { UserPlus, MapPin, Clock, LogIn } from "lucide-react"
// import WorldMap from "@/components/world-map"
import TimeDisplay from "../../components/time-display"
import CityTimeDisplay from "../../components/city-time-display"
import LoginModal from "../../components/login-modal"
import MapControls from "../../components/map-controls"
import { Button } from "../../components/ui/button"
import { fetchData } from "../../servics/apiService"
import { motion } from "framer-motion"


export default function FirstPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showLogin, setShowLogin] = useState(false)
  const [modalView, setModalView] = useState<"login" | "signup">("login")
  const [activeTab, setActiveTab] = useState("home")
  const [dailyEvent, setDailyEvent] = useState<string>('Loading event...');
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(true);
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

  const fetchDailyEvent = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are 0-indexed
    const day = today.getDate();
    const country = "US"; // Replace with dynamic country if needed

    try {
      setIsLoadingEvent(true); // Set loading state
      const events = await fetchData("/daily-events", {
        params: { country, year, month, day },
      });

      console.log(events)
      if (events && events.data.length > 0) {
        const eventNames = events.data
          .slice(0, 2) // Take only the first two events
          .map((event: any) => event.name)
          .join(", ");
        setDailyEvent(eventNames);
      } else {
        setDailyEvent("No events today.");
      }
    } catch (error) {
      console.error("Error fetching daily event:", error);
      setDailyEvent("Failed to load event.");
    } finally {
      setIsLoadingEvent(false); // Clear loading state
    }
  };

  useEffect(() => {
    fetchDailyEvent();
  }, []);

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

  // Open login modal with specific view
  const openModal = (view: "login" | "signup") => {
    setModalView(view)
    setShowLogin(true)
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

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="absolute top-4 right-4 flex gap-3">
          <Button
            onClick={() => openModal("login")}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800 text-white rounded-full px-5 py-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
          <Button
            onClick={() => openModal("signup")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/40"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 mb-12"
        >
          <TimeDisplay
            date={new Date(currentTime.getTime() + currentTime.getTimezoneOffset() * 60000)}
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
            {isLoadingEvent ? "Loading event..." : dailyEvent}
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

        {/* <motion.div
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
          </motion.div> */}
      </div>
      {showLogin && <LoginModal initialView={modalView} onClose={() => setShowLogin(false)} />}
    </div>
  )
}