"use client"

import { useState } from "react"
import {
  Layers,
  Settings,
  Info,
  Sun,
  Cloud,
  Thermometer,
  Globe,
  Zap,
  Plane,
  ChevronRight,
  ChevronLeft,
  Moon,
  Eye,
  Sliders,
  PanelLeft,
  Clock,
  Compass,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MapControls() {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("layers")
  const [expandedSection, setExpandedSection] = useState<string | null>("timeZones")

  const [selectedLocation, setSelectedLocation] = useState({
    name: "Custom Location",
    timezone: "UTC",
    coordinates: "-11.87, -37.62",
  })

  // Layer toggles
  const [showTimeZones, setShowTimeZones] = useState(true)
  const [showDayNight, setShowDayNight] = useState(true)
  const [showSunMoon, setShowSunMoon] = useState(true)
  const [showWeather, setShowWeather] = useState(false)
  const [showEarthquakes, setShowEarthquakes] = useState(false)
  const [showAirTraffic, setShowAirTraffic] = useState(false)

  // Map settings
  const [mapResolution, setMapResolution] = useState(75)
  const [mapStyle, setMapStyle] = useState("dark")
  const [timeFormat, setTimeFormat] = useState("24h")
  const [tempUnit, setTempUnit] = useState("celsius")
  const [enable4K, setEnable4K] = useState(true)
  const [smoothAnimations, setSmoothAnimations] = useState(true)

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -320, opacity: 0 },
  }

  const sectionVariants = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    expanded: { height: "auto", opacity: 1, overflow: "visible" },
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-20 left-0 z-20"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-700 shadow-lg flex items-center gap-2 pl-2 pr-3 rounded-r-full rounded-l-none h-12"
        >
          <PanelLeft className="h-5 w-5 text-indigo-400" />
          <span>Controls</span>
        </Button>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="closed"
        animate="open"
        variants={sidebarVariants}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute left-0 top-0 h-full z-20"
      >
        <div className="bg-gray-900/95 backdrop-blur-md border-r border-gray-800/50 text-white h-full w-80 shadow-xl flex flex-col overflow-auto">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Map Controls
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Location info */}
          <div className="p-4 border-b border-gray-800/50 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-indigo-400 font-medium">Selected Location</h3>
              <Badge variant="outline" className="bg-indigo-900/50 text-indigo-300 border-indigo-800">
                Active
              </Badge>
            </div>
            <p className="font-bold text-lg mt-1">{selectedLocation.name}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="bg-gray-800/50 rounded-md p-2">
                <span className="text-gray-400">Timezone</span>
                <p className="text-white">{selectedLocation.timezone}</p>
              </div>
              <div className="bg-gray-800/50 rounded-md p-2">
                <span className="text-gray-400">Coordinates</span>
                <p className="text-white">{selectedLocation.coordinates}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="layers" onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 p-1 m-4 bg-gray-800/70 rounded-lg">
              <TabsTrigger
                value="layers"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md"
              >
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md"
              >
                <Info className="h-4 w-4 mr-2" />
                Info
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              <TabsContent value="layers" className="mt-0 h-full">
                <div className="space-y-4">
                  {/* Time Zones Section */}
                  <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30">
                    <button
                      onClick={() => toggleSection("timeZones")}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-indigo-900/50 p-1.5 rounded-md mr-3">
                          <Clock className="h-5 w-5 text-indigo-400" />
                        </div>
                        <span className="font-medium">Time Zones</span>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          checked={showTimeZones}
                          onCheckedChange={setShowTimeZones}
                          className="mr-2 data-[state=checked]:bg-indigo-600"
                        />
                        {/* <ChevronRight
                          className={`h-5 w-5 transition-transform ${expandedSection === "timeZones" ? "rotate-90" : ""}`}
                        /> */}
                      </div>
                    </button>

                    {/* <motion.div
                      variants={sectionVariants}
                      initial="collapsed"
                      animate={expandedSection === "timeZones" ? "expanded" : "collapsed"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-3 pt-0 space-y-3 border-t border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Display grid lines</label>
                          <Switch
                            checked={showTimeZones}
                            onCheckedChange={setShowTimeZones}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Grid opacity</label>
                          <Slider defaultValue={[70]} max={100} step={5} className="py-1" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Show labels</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                      </div>
                    </motion.div> */}
                  </div>

                  {/* Day/Night Section */}
                  <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30">
                    <button
                      onClick={() => toggleSection("dayNight")}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-purple-900/50 p-1.5 rounded-md mr-3">
                          <Sun className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="font-medium">Day/Night</span>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          checked={showDayNight}
                          onCheckedChange={setShowDayNight}
                          className="mr-2 data-[state=checked]:bg-indigo-600"
                        />
                        {/* <ChevronRight
                          className={`h-5 w-5 transition-transform ${expandedSection === "dayNight" ? "rotate-90" : ""}`}
                        /> */}
                      </div>
                    </button>

                    {/* <motion.div
                      variants={sectionVariants}
                      initial="collapsed"
                      animate={expandedSection === "dayNight" ? "expanded" : "collapsed"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-3 pt-0 space-y-3 border-t border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Show terminator line</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Shadow intensity</label>
                          <Slider defaultValue={[60]} max={100} step={5} className="py-1" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Realistic shading</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                      </div>
                    </motion.div> */}
                  </div>

                  {/* Sun & Moon Section */}
                  <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30">
                    <button
                      onClick={() => toggleSection("sunMoon")}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-amber-900/50 p-1.5 rounded-md mr-3">
                          <Moon className="h-5 w-5 text-amber-300" />
                        </div>
                        <span className="font-medium">Sun & Moon</span>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          checked={showSunMoon}
                          onCheckedChange={setShowSunMoon}
                          className="mr-2 data-[state=checked]:bg-indigo-600"
                        />
                        {/* <ChevronRight
                          className={`h-5 w-5 transition-transform ${expandedSection === "sunMoon" ? "rotate-90" : ""}`}
                        /> */}
                      </div>
                    </button>

                    {/* <motion.div
                      variants={sectionVariants}
                      initial="collapsed"
                      animate={expandedSection === "sunMoon" ? "expanded" : "collapsed"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-3 pt-0 space-y-3 border-t border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Show Sun position</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Show Moon position</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300">Show glow effects</label>
                          <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                        </div>
                      </div>
                    </motion.div> */}
                  </div>

                  {/* Premium Features */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">Premium Features</h3>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">PRO</Badge>
                    </div>

                    <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30 opacity-80">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <div className="bg-blue-900/50 p-1.5 rounded-md mr-3">
                            <Cloud className="h-5 w-5 text-blue-400" />
                          </div>
                          <span className="font-medium">Weather</span>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={showWeather}
                            onCheckedChange={setShowWeather}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30 opacity-80">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <div className="bg-amber-900/50 p-1.5 rounded-md mr-3">
                            <Zap className="h-5 w-5 text-amber-400" />
                          </div>
                          <span className="font-medium">Earthquakes</span>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={showEarthquakes}
                            onCheckedChange={setShowEarthquakes}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/30 opacity-80">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <div className="bg-sky-900/50 p-1.5 rounded-md mr-3">
                            <Plane className="h-5 w-5 text-sky-400" />
                          </div>
                          <span className="font-medium">Air Traffic</span>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={showAirTraffic}
                            onCheckedChange={setShowAirTraffic}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg border border-indigo-800/50">
                      <p className="text-sm">
                        Unlock premium features with a subscription.
                        <Button variant="link" className="text-indigo-400 p-0 h-auto text-sm ml-1">
                          Upgrade now
                        </Button>
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 h-full">
                <div className="space-y-6">
                  {/* Map Style */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center">
                      <Palette className="h-4 w-4 mr-2 text-indigo-400" />
                      Map Style
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["dark", "light", "satellite", "topographic", "political"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setMapStyle(style)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                            mapStyle === style
                              ? "bg-indigo-600/20 border-indigo-500"
                              : "bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/40"
                          }`}
                        >
                          <div
                            className={`w-full h-12 rounded-md mb-2 ${
                              style === "dark"
                                ? "bg-gray-900"
                                : style === "light"
                                  ? "bg-gray-300"
                                  : style === "satellite"
                                    ? "bg-blue-900"
                                    : style === "topographic"
                                      ? "bg-green-900"
                                      : "bg-indigo-900"
                            }`}
                          ></div>
                          <span className="text-sm capitalize">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Map Resolution */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center">
                      <Sliders className="h-4 w-4 mr-2 text-indigo-400" />
                      Map Resolution
                    </h3>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[mapResolution]}
                        min={25}
                        max={100}
                        step={5}
                        onValueChange={(value) => setMapResolution(value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-center bg-gray-800 rounded-md py-1">{mapResolution}%</span>
                    </div>
                    <p className="text-xs text-gray-400">Higher resolution requires more processing power</p>
                  </div>

                  {/* Time Format */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                      Time Format
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTimeFormat("24h")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm ${
                          timeFormat === "24h"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        24-hour
                      </button>
                      <button
                        onClick={() => setTimeFormat("12h")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm ${
                          timeFormat === "12h"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        12-hour (AM/PM)
                      </button>
                    </div>
                  </div>

                  {/* Temperature Unit */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-indigo-400" />
                      Temperature Unit
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTempUnit("celsius")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm ${
                          tempUnit === "celsius"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        Celsius (°C)
                      </button>
                      <button
                        onClick={() => setTempUnit("fahrenheit")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm ${
                          tempUnit === "fahrenheit"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        Fahrenheit (°F)
                      </button>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-indigo-400" />
                      Display Options
                    </h3>
                    <div className="space-y-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center justify-between">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label className="text-sm text-gray-300 flex items-center cursor-help">
                              Enable 4K support
                              <Info className="h-3 w-3 ml-1 text-gray-500" />
                            </label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">Enables high-resolution map rendering for 4K displays</p>
                          </TooltipContent>
                        </Tooltip>
                        <Switch
                          checked={enable4K}
                          onCheckedChange={setEnable4K}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label className="text-sm text-gray-300 flex items-center cursor-help">
                              Smooth animations
                              <Info className="h-3 w-3 ml-1 text-gray-500" />
                            </label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">Enables smooth transitions and animations</p>
                          </TooltipContent>
                        </Tooltip>
                        <Switch
                          checked={smoothAnimations}
                          onCheckedChange={setSmoothAnimations}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">Reduce motion</label>
                        <Switch className="data-[state=checked]:bg-indigo-600" />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">High contrast</label>
                        <Switch className="data-[state=checked]:bg-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="mt-0 h-full">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      World Time Map provides real-time visualization of time zones, weather patterns, and other global
                      data.
                    </p>

                    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-indigo-800/30">
                      <h3 className="font-medium flex items-center text-indigo-300">
                        <Globe className="h-5 w-5 mr-2 text-indigo-400" />
                        About This Project
                      </h3>
                      <p className="text-sm mt-2 text-gray-300">
                        This interactive world map allows you to explore time zones, track day/night cycles, and monitor
                        celestial positions in real-time. Premium features include weather data, earthquake tracking,
                        and more.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">Feature Highlights</h3>

                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                      <h4 className="font-medium flex items-center text-amber-300">
                        <Sun className="h-4 w-4 mr-2 text-amber-400" />
                        Sun & Moon Tracking
                      </h4>
                      <p className="text-xs mt-1 text-gray-300">
                        Track the real-time positions of the Sun and Moon across the globe. View sunrise and sunset
                        times for any location.
                      </p>
                    </div>

                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                      <h4 className="font-medium flex items-center text-blue-300">
                        <Cloud className="h-4 w-4 mr-2 text-blue-400" />
                        Weather Data
                      </h4>
                      <p className="text-xs mt-1 text-gray-300">
                        Premium feature: Access real-time weather data including temperature, precipitation, and cloud
                        cover from trusted sources.
                      </p>
                      <Badge className="mt-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                        PREMIUM
                      </Badge>
                    </div>

                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                      <h4 className="font-medium flex items-center text-emerald-300">
                        <Compass className="h-4 w-4 mr-2 text-emerald-400" />
                        High-Resolution Maps
                      </h4>
                      <p className="text-xs mt-1 text-gray-300">
                        Experience crystal clear maps with support for ultra-high resolution displays and multiple map
                        styles.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>

                  <div className="pt-4 text-center text-xs text-gray-500">
                    <p>
                      Version: 1.2.0
                      <br />© 2025 World Time Map
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

