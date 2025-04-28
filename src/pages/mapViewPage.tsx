"use client"
import React, { useState } from 'react';
import { UserPlus, MapPin, Clock, LogIn } from "lucide-react"
import CityTimeDisplay from "@/components/city-time-display"
import WorldMap from "@/components/world-map"
import MapControls from "@/components/map-controls"

const MapViewPage: React.FC = () => {
    const [selectedLocation, setSelectedLocation] = useState({
        name: "London",
        timezone: "Europe/London",
        lat: 51.51,
        lng: -0.13,
    })
    const headerCities = [
        { name: "UTC", timezone: "UTC" },
        { name: "London", timezone: "Europe/London" },
        { name: "Hong Kong", timezone: "Asia/Hong_Kong" },
        { name: "Delhi", timezone: "Asia/Kolkata" },
        { name: "New York", timezone: "America/New_York" },
        { name: "Rio", timezone: "America/Sao_Paulo" },
    ]

    return (
        <div>
            <div className="flex flex-col h-screen">
                {/* Header with clocks */}
                <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-2 flex items-center overflow-x-auto shadow-lg z-10">
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
                                {city.name !== "UTC" && (
                                    <div className="text-xs mt-1 text-gray-300">
                                        {new Intl.DateTimeFormat("en-US", {
                                            weekday: "short",
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            timeZone: city.timezone, // Use the city's timezone
                                        }).format(new Date())}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>


                </header>

                {/* Main content */}
                <div className="flex flex-grow relative">
                    <WorldMap selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />

                    <MapControls />
                </div>
            </div>
        </div>
    );
};

export default MapViewPage;