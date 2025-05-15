import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MapPin, Plus, Minus, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";
import { fetchData, postData, deleteData } from "../servics/apiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"; // Adjust the import path based on your project structure
import { jwtDecode } from "jwt-decode"
import CityTimeDisplay from "../components/city-time-display"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import MapControls from "./map-controls";
import { motion, AnimatePresence } from "framer-motion"
import { DayNightOverlay } from './day-night-overlay';
import { useCelestialPositions } from "../hooks/useCelestialPositions"
import { getAllCountries, Country } from "countries-and-timezones"
import Header from "./header";
// import cities from "all-the-cities";

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoia3Zjb2F0ZXMiLCJhIjoiY21hNTd0bTZjMDQ0aDJyczkyeG9iZTE5OCJ9.anKjK_Ynna30II4T5t4TeQ";

// Define types
interface PinData {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  color?: string;
  userId: string | null;
}

interface WorldMapProps {
  // Add any props you need
}
interface JwtPayload {
  id: string;
}

interface City {
  name: string
  region: string
  timezone: string
  weather?: {
    condition: string
    temperature: number
    icon: React.ReactNode
  }
}

const weatherIcons = {
  sunny: <Sun className="h-5 w-5 text-yellow-300" />,
  cloudy: <Cloud className="h-5 w-5 text-gray-300" />,
  rainy: <CloudRain className="h-5 w-5 text-blue-300" />,
  snowy: <CloudSnow className="h-5 w-5 text-white" />,
  stormy: <CloudLightning className="h-5 w-5 text-yellow-300" />,
  windy: <Wind className="h-5 w-5 text-blue-200" />,
}


const countryList = Object.values(getAllCountries());
const WorldMap: React.FC<WorldMapProps> = () => {
  // Map state
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pin state
  const [userLocations, setUserLocations] = useState<PinData[]>([]);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [tempMarker, setTempMarker] = useState<mapboxgl.Marker | null>(null);
  const sunMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const moonMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [earthquakeMarkers, setEarthquakeMarkers] = useState<mapboxgl.Marker[]>([]);

  // Add pin modal state
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [newPinName, setNewPinName] = useState('');
  const [newPinLat, setNewPinLat] = useState('');
  const [newPinLng, setNewPinLng] = useState('');

  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h")
  const [overlayUpdateTrigger, setOverlayUpdateTrigger] = useState(0);
  const [showSunAndMoon, setShowSunAndMoon] = useState(false);
  const [showDayNightOverlay, setShowDayNightOverlay] = useState(false);
  const [showEarthquakes, setShowEarthquakes] = useState(false); // Toggle state for earthquake markers
  const [selectedCountry, setSelectedCountry] = useState("");
  const [filteredCities, setFilteredCities] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [searchCities, setSearchCities] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [selectedCity, setSelectedCity] = useState(false);

  const { sun, moon } = useCelestialPositions();


  // Collect current settings
  const [headerCities, setHeaderCities] = useState<City[]>([
    {
      name: "UTC",
      region: "Universal",
      timezone: "UTC",
    },
    {
      name: "London",
      region: "Europe",
      timezone: "Europe/London",
      weather: {
        condition: "cloudy",
        temperature: 12,
        icon: weatherIcons.cloudy,
      },
    },
    {
      name: "Hong Kong",
      region: "Asia",
      timezone: "Asia/Hong_Kong",
      weather: {
        condition: "rainy",
        temperature: 24,
        icon: weatherIcons.rainy,
      },
    },
    {
      name: "Delhi",
      region: "Asia",
      timezone: "Asia/Kolkata",
      weather: {
        condition: "cloudy",
        temperature: 4,
        icon: weatherIcons.cloudy,
      },
    },
    {
      name: "New York",
      region: "America",
      timezone: "America/New_York",
      weather: {
        condition: "sunny",
        temperature: 18,
        icon: weatherIcons.sunny,
      },
    },
    {
      name: "Rio",
      region: "America",
      timezone: "America/Sao_Paulo",
      weather: {
        condition: "stormy",
        temperature: 28,
        icon: weatherIcons.stormy,
      },
    },
  ])

  // Helper function to get current user ID
  const getCurrentUserId = (): string | null => {
    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log("No auth token found");
      return null;
    }

    try {
      // Decode the JWT token
      const decoded = jwtDecode<JwtPayload>(token);
      console.log(decoded)
      // Return the user ID from the token
      return decoded?.id;
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  };


  // Function to disable pin placement mode
  const disablePinPlacementMode = () => {
    setIsAddingPin(false);
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  // Function to fetch pins from server
  const fetchPinsFromServer = async (): Promise<PinData[]> => {
    try {
      const userId = getCurrentUserId();
      console.log("Fetching pins for user:", userId);

      // Fetch pins for the current user
      const response = await fetchData(`/map-pins/user/${userId}`);
      console.log("Pins fetched from server:", response);

      // Handle different response formats
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && Array.isArray(response)) {
        return response;
      } else if (response && !Array.isArray(response)) {
        // If it's a single object, wrap it in an array
        return [response];
      }

      return [];
    } catch (error) {
      console.error("Error fetching pins from server:", error);
      return [];
    }
  };

  // Function to save pin to server
  const savePinToServer = async (pin: PinData): Promise<any> => {
    try {
      const response = await postData("/map-pins", pin);
      console.log("Pin saved to server:", response);
      return response;
    } catch (error) {
      console.error("Error saving pin to server:", error);
      throw error;
    }
  };

  // Function to add marker to map
  const addMarkerToMap = (pin: PinData & { id: string }) => {
    if (!map.current) {
      console.error("Map not initialized, cannot add marker");
      return null;
    }

    console.log("Adding marker for pin:", pin);

    // Create marker element
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundColor = pin.color || '#FF5733';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    // Create unique IDs for popup content
    const locationNameId = `location-name-${pin.id}`;
    const sunriseTimeId = `sunrise-time-${pin.id}`;
    const sunsetTimeId = `sunset-time-${pin.id}`;

    // Create HTML content for the popup
    const popupContent = `
   <div class="p-4 bg-gray-900 rounded-lg shadow-lg text-white">
    <h3 class="text-lg font-bold mb-2" id="${locationNameId}">Loading location...</h3>
    <div class="flex items-center justify-between text-sm pl-0 pr-0">
      <div class="flex items-center text-amber-400">
        <span id="sun-icon"></span>
        <span>Sunrise:</span>
        <p id="${sunriseTimeId}" class="font-medium text-white">Loading...</p>
      </div>
      <div class="flex items-center text-indigo-400">
        <span id="moon-icon"></span>
        <span>Sunset:</span>
        <p id="${sunsetTimeId}" class="font-medium text-white">Loading...</p>
      </div>
    </div>
  </div>
  `;

    // Dynamically render the Sun and Moon icons using React
    const sunIconContainer = document.getElementById("sun-icon");
    const moonIconContainer = document.getElementById("moon-icon");

    if (sunIconContainer) {
      const sunRoot = createRoot(sunIconContainer);
      sunRoot.render(<Sun className="h-4 w-4" />);
    }

    if (moonIconContainer) {
      const moonRoot = createRoot(moonIconContainer);
      moonRoot.render(<Moon className="h-4 w-4" />);
    }

    // Create popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      className: 'custom-popup',
      maxWidth: '250px',
    }).setHTML(popupContent);

    // Add marker to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat([pin.lng, pin.lat])
      .setPopup(popup)
      .addTo(map.current);

    // Store marker reference
    markersRef.current[pin.id] = marker;

    // Fetch location name and sunrise/sunset times when the popup is opened
    marker.getElement().addEventListener('click', async () => {
      if (!marker.getPopup()?.isOpen()) {
        marker.togglePopup();

        try {
          // Fetch location name using reverse geocoding
          const locationNameElement = document.getElementById(locationNameId);
          const locationName = await fetchLocationName(pin.lat, pin.lng);
          if (locationNameElement) {
            locationNameElement.textContent = locationName || "Unknown Location";
          }

          // Fetch sunrise and sunset times
          const sunriseElement = document.getElementById(sunriseTimeId);
          const sunsetElement = document.getElementById(sunsetTimeId);
          const { sunrise, sunset } = await fetchSunriseSunset(pin.lat, pin.lng);
          if (sunriseElement) sunriseElement.textContent = sunrise || "Unavailable";
          if (sunsetElement) sunsetElement.textContent = sunset || "Unavailable";
        } catch (error) {
          console.error("Error fetching location or sunrise/sunset times:", error);
        }
      }
    });

    console.log("Marker created and added to map");
    return marker;
  };

  const fetchLocationName = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
      const data = await fetchData(url); // Use fetchData instead of fetch
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name; // Return the first result
      }
      return null;
    } catch (error) {
      console.error("Error fetching location name:", error);
      return null;
    }
  };

  const fetchCitiesForCountry = async (countryCode: string) => {
    const res = await fetchData(`/cities/${countryCode}`);
    setFilteredCities(res);
    setSearchCities(res);
    console.log(res);
  };

  const getCitiesForCountry = (query: string) => {
    console.log(filteredCities.filter(item => item.name.indexOf(query) !== -1))
    if (query === "") {
      setSearchCities(filteredCities)
    } else {
      setSearchCities(filteredCities.filter(item => item.name.indexOf(query) !== -1))
    }
  }
  const fetchSunriseSunset = async (lat: number, lng: number): Promise<{ sunrise: string; sunset: string }> => {
    try {
      const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
      const data = await fetchData(url); // Use fetchData instead of fetch
      console.log(data)
      if (data.status === "OK") {
        const sunrise = new Date(data.results.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.results.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { sunrise, sunset };
      }
      return { sunrise: "Unavailable", sunset: "Unavailable" };
    } catch (error) {
      console.error("Error fetching sunrise/sunset times:", error);
      return { sunrise: "Unavailable", sunset: "Unavailable" };
    }
  };
  // Function to refresh all pins
  const refreshAllPins = async () => {
    if (!map.current) {
      console.error("Map not initialized, cannot refresh pins");
      return;
    }

    try {
      console.log("Refreshing all pins...");

      // Clear existing markers from the map - with error handling
      try {
        Object.values(markersRef.current).forEach(marker => {
          try {
            // Close popup if open
            if (marker.getPopup && marker.getPopup()?.isOpen()) {
              marker.getPopup()?.remove();
            }
          } catch (popupError) {
            console.warn("Error closing popup:", popupError);
          }

          try {
            marker.remove();
          } catch (markerError) {
            console.warn("Error removing marker:", markerError);
          }
        });
      } catch (markersError) {
        console.warn("Error clearing markers:", markersError);
      }

      // Reset markers reference
      markersRef.current = {};

      // Fetch all pins from server with a small delay to ensure deletion is processed
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const pins = await fetchPinsFromServer();
        console.log("Fetched pins after refresh:", pins);

        // Filter out any pins without IDs to prevent errors
        const validPins = Array.isArray(pins) ? pins.filter(pin => pin && pin.id) : [];
        console.log("Valid pins to display:", validPins);

        // Update state with filtered pins
        setUserLocations(validPins);

        if (validPins.length > 0) {
          // Add markers for each valid pin
          validPins.forEach(pin => {
            try {
              const marker = addMarkerToMap(pin as PinData & { id: string });
              if (marker) {
                console.log(`Added marker for pin ${pin.id}`);
              } else {
                console.warn(`Failed to add marker for pin ${pin.id}`);
              }
            } catch (markerError) {
              console.error(`Error adding marker for pin ${pin.id}:`, markerError);
            }
          });

          console.log(`Refreshed ${validPins.length} pins on the map`);
        } else {
          console.log("No pins found to display");
        }
      } catch (fetchError) {
        console.error("Error fetching pins:", fetchError);
        toast.error("Error loading locations");
      }
    } catch (error) {
      console.error("Error in refreshAllPins:", error);
      toast.error("Error refreshing map");
    }
  };
  // Function to add custom pin
  const addCustomPin = async () => {
    // Validate inputs
    if (!newPinName || !newPinLat || !newPinLng) {
      toast.error("Please fill in all fields");
      return;
    }

    const lat = parseFloat(newPinLat);
    const lng = parseFloat(newPinLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Invalid coordinates");
      return;
    }

    // Create new pin with user ID
    const newPin: PinData = {
      name: newPinName,
      lat,
      lng,
      color: '#FF5733',
      userId: getCurrentUserId()
    };

    try {
      // Save pin to server
      const response = await savePinToServer(newPin);
      console.log("Server response after saving pin:", response);

      if (response) {
        toast.success("Location saved successfully!");

        // Refresh all pins to ensure consistency
        await refreshAllPins();
      } else {
        toast.error("Failed to save location");
      }
    } catch (error) {
      console.error("Error saving pin:", error);
      toast.error("Error saving location");
    }

    // Close modal and reset form
    setShowAddPinModal(false);
    setNewPinLat("");
    setNewPinLng("");
    setNewPinName("");
    setSelectedCountry("");
    setSelectedCity(false);
    setSearchCities([]);

    // Remove temporary marker if it exists
    if (tempMarker) {
      tempMarker.remove();
      setTempMarker(null);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!map.current && mapRef.current) {
      // Wait for the container to be properly sized
      const initializeMap = () => {
        if (!mapRef.current) return;

        // Force container dimensions before map creation
        mapRef.current.style.width = "100%";
        mapRef.current.style.height = "100%";

        map.current = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/satellite-v8",
          center: [0, 0],
          zoom: zoom,
          minZoom: 1,
          maxZoom: 18,
          pitch: 0,
          bearing: 0,
          attributionControl: false,
          projection: "mercator",
        });

        // Add event listener for when map is fully loaded
        map.current.on("load", async () => {
          console.log("Map loaded, initializing layers and loading pins...");

          if (!map.current?.getLayer("country-boundaries")) {
            try {
              // Add country boundaries layer
              map.current?.addLayer({
                id: "country-boundaries",
                type: "line",
                source: {
                  type: "vector",
                  url: "mapbox://mapbox.country-boundaries-v1",
                },
                "source-layer": "country_boundaries",
                paint: {
                  "line-color": "#ffffff",
                  "line-width": 1,
                  "line-opacity": 0.5,
                },
              });
              console.log("Added country boundaries layer");
            } catch (error) {
              console.error("Error adding country boundaries layer:", error);
            }
          }
          fetchAndDisplayEarthquakes();


          map.current?.on('mousemove', (e) => {
            if (isAddingPin && tempMarker) {
              // Update temporary marker position as user moves mouse
              tempMarker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
            }
          });

          // Hide logo if needed
          const logo = document.querySelector(".mapboxgl-ctrl-logo") as HTMLElement;
          if (logo) {
            logo.style.display = "none";
          }

          // Force resize after load
          map.current?.resize();

          // Load pins after map is fully initialized
          await refreshAllPins();
        });

      };

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        initializeMap();
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (tempMarker) {
        tempMarker.remove();
      }
    };
  }, [zoom, isAddingPin]);

  useEffect(() => {
    // console.log("Sun position:", sun); 
    // console.log("Moon position:", moon);

    if (map.current) {
      sunMarkerRef.current?.setLngLat([sun.longitude, sun.latitude]);
      moonMarkerRef.current?.setLngLat([moon.longitude, moon.latitude]);
    }
  }, [sun, moon]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // // Update the overlay periodically
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setOverlayUpdateTrigger((prev) => prev + 1); // Increment to trigger re-render
  //   }, 60000); // Update every 60 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);
  // Add custom CSS for markers
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        width: 24px !important;
        height: 24px !important;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        cursor: pointer;
        z-index: 1;
      }
      
      .mapboxgl-popup-content {
        background-color: rgba(35, 35, 35, 0.9) !important;
        color: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 0 15px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const fetchAndDisplayEarthquakes = async () => {
    if (!map.current || !showEarthquakes) return; // Only fetch if toggle is ON

    try {
      console.log("EarthQuake Data");
      // Fetch earthquake data using fetchData from apiService
      const data = await fetchData('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');

      // Clear existing earthquake markers
      earthquakeMarkers.forEach((marker) => marker.remove());
      setEarthquakeMarkers([]);

      // Add new earthquake markers
      const newMarkers = data.features.map((feature: any) => {
        const { coordinates } = feature.geometry;
        const { mag, place, time } = feature.properties;

        // Create marker element
        const el = document.createElement('div');
        el.className = 'earthquake-marker';
        el.style.width = `${Math.max(10, mag * 5)}px`; // Size based on magnitude
        el.style.height = `${Math.max(10, mag * 5)}px`;
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';

        // Create popup content
        const popupContent = `
          <div>
            <h3 class="text-sm font-bold">Magnitude: ${mag}</h3>
            <p class="text-xs">Location: ${place}</p>
            <p class="text-xs">Time: ${new Date(time).toLocaleString()}</p>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        // Add marker to map
        // if (showEarthquakes) {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([coordinates[0], coordinates[1]])
          .setPopup(popup)
          .addTo(map.current!);

        return marker;


      });

      setEarthquakeMarkers(newMarkers);
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      toast.error('Failed to load earthquake data.');
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndDisplayEarthquakes();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [earthquakeMarkers]);

  useEffect(() => {
    if (!map.current) return;

    // Use requestAnimationFrame to defer heavy operations
    const handleToggle = () => {
      if (showSunAndMoon) {
        // Add or update Sun marker
        if (!sunMarkerRef.current) {
          const sunEl = document.createElement("div");
          const sunRoot = createRoot(sunEl);
          sunRoot.render(
            <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <Sun className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-yellow-500/30 animate-pulse" />
                <div className="absolute -top-2 -right-2 -left-2 -bottom-2 rounded-full bg-yellow-500/20" />
                <div className="absolute -top-4 -right-4 -left-4 -bottom-4 rounded-full bg-yellow-500/10" />
                <div className="absolute -top-8 -right-8 -left-8 -bottom-8 rounded-full bg-yellow-500/5 animate-pulse-glow" />
              </div>
            </div>
          );

          sunMarkerRef.current = new mapboxgl.Marker(sunEl)
            .setLngLat([sun.longitude, sun.latitude])
            .addTo(map.current!);
        } else {
          sunMarkerRef.current.setLngLat([sun.longitude, sun.latitude]);
        }

        // Add or update Moon marker
        if (!moonMarkerRef.current) {
          const moonEl = document.createElement("div");
          const moonRoot = createRoot(moonEl);
          moonRoot.render(
            <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2">
              <Moon className="h-7 w-7 text-indigo-400 fill-indigo-400" />
              <div className="absolute -top-1 -right-1 -left-1 -bottom-1 rounded-full bg-indigo-400/30 animate-pulse" />
              <div className="absolute -top-2 -right-2 -left-2 -bottom-2 rounded-full bg-indigo-400/20" />
            </div>
          );

          moonMarkerRef.current = new mapboxgl.Marker(moonEl)
            .setLngLat([moon.longitude, moon.latitude])
            .addTo(map.current!);
        } else {
          moonMarkerRef.current.setLngLat([moon.longitude, moon.latitude]);
        }
      } else {
        // Remove markers if toggle is off
        sunMarkerRef.current?.remove();
        moonMarkerRef.current?.remove();
        sunMarkerRef.current = null;
        moonMarkerRef.current = null;
      }
    };

    // Use requestAnimationFrame for smoother updates
    const animationFrameId = requestAnimationFrame(handleToggle);

    return () => cancelAnimationFrame(animationFrameId);
  }, [showSunAndMoon, sun, moon]);


  useEffect(() => {
    if (showEarthquakes) {
      fetchAndDisplayEarthquakes(); // Fetch data when toggle is ON
    } else {
      // Remove earthquake markers when toggle is OFF
      earthquakeMarkers.forEach((marker) => {
        if (marker) {
          try {
            marker.remove();
          } catch (error) {
            console.warn("Error removing marker:", error);
          }
        }
      });
      setEarthquakeMarkers([]); // Clear the array
    }
  }, [showEarthquakes]); // Re-run when toggle state changes

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  async function fetchAllCitiesByCountry(countryCode: string) {
    const allCities = [];
    let offset = 0;
    const limit = 10; // Use a limit allowed by your plan

    while (true) {
      const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=${countryCode}&limit=${limit}&offset=${offset}`;

      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": "cc66cd8cf8msh0150225ff582b53p14ff52jsn4484decd019b",
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (!data.data || data.data.length === 0) break;

      allCities.push(...data.data);

      if (data.data.length < limit) break;

      offset += limit;

      // 🕒 Wait 500ms before the next request to avoid rate limits
      await sleep(500);
    }

    setSearchCities(allCities);

  }
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex flex-col h-full w-full">
        <Header headerCities={headerCities} />
        <div className="relative flex-1 w-full">
          <div className="relative w-full h-full overflow-hidden bg-gray-900">
            {/* Add Pin Button */}
            <div className="absolute top-4 right-8 z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // enablePinPlacementMode();
                  setShowAddPinModal(true);
                }}
                className="bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white hover:bg-gray-700 h-12 w-12 rounded-full shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            {/* Time indicator */}
            <div className="absolute bottom-8 right-8 z-20 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3">
              <div className="text-center">
                <div className="text-xs text-gray-400">Your Current Time</div>
                <div className="text-2xl font-bold text-white h-8 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`time-${timeFormat}-utc`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block min-w-[10ch] text-center"
                    >
                      {currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: timeFormat === "12h",
                        timeZone: "UTC",
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Map container */}
            <div
              ref={mapRef}
              className="absolute inset-0 w-full h-full"
            >
            </div>
            {/* Day/Night overlay */}
            {showDayNightOverlay && map.current && (
              <DayNightOverlay
                map={map.current}
                visible={true}
                highContrast={true}
              // key={overlayUpdateTrigger}
              />
            )}
            {/* Add Pin Modal */}
            <Dialog open={showAddPinModal} onOpenChange={setShowAddPinModal}>
              <DialogContent className="bg-gray-900 text-white border border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Country Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="country-select">Select Country</Label>
                    <select
                      id="country-select"
                      value={selectedCountry}
                      onChange={(e) => {
                        const countryCode = e.target.value;
                        setSelectedCountry(countryCode);
                        fetchCitiesForCountry(countryCode);
                        setNewPinLat("");
                        setNewPinLng("");
                        setNewPinName("");
                        setSelectedCity(false);
                        setSearchCities([]);
                        // const countryCode = "GB"; // Use ISO-3166-1 alpha-2 country code
                        const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=${countryCode}&limit=10`;

                        fetchAllCitiesByCountry(countryCode)

                      }}
                      className="bg-gray-800 border-gray-700 text-white w-full p-2 rounded-lg"
                    >
                      <option value="" disabled>
                        -- Select a Country --
                      </option>
                      {countryList.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="city-combobox">Search City</Label>
                    <Command className="bg-gray-800 border-gray-700 text-white">
                      <CommandInput
                        id="city-command"
                        placeholder="Type a city name (e.g., New York)"
                        value={newPinName}
                        onValueChange={(value: string) => {
                          const query = value;
                          setNewPinName(query);
                          // Fetch cities dynamically based on user input
                          getCitiesForCountry(query);
                          setSelectedCity(false)
                        }}
                      />
                      <CommandList>
                        {searchCities.length > 0 || selectedCity === true ? (
                          searchCities.map((city, index) => (
                            <CommandItem
                              key={`${city.name}-${index}`}
                              onSelect={() => {
                                setNewPinName(city.name);
                                setNewPinLat(city.lat.toString());
                                setNewPinLng(city.lng.toString());
                                setSearchCities([]); // Clear the dropdown after selection
                                setSelectedCity(true);
                              }}
                            >
                              {city.name}
                            </CommandItem>
                          ))
                        ) : (
                          <CommandEmpty>No cities found</CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </div>

                  {/* Latitude and Longitude Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin-lat">Latitude</Label>
                      <Input
                        id="pin-lat"
                        value={newPinLat}
                        onChange={(e) => setNewPinLat(e.target.value)}
                        placeholder="e.g. 40.7128"
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin-lng">Longitude</Label>
                      <Input
                        id="pin-lng"
                        value={newPinLng}
                        onChange={(e) => setNewPinLng(e.target.value)}
                        placeholder="e.g. -74.0060"
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddPinModal(false);
                      if (tempMarker) {
                        tempMarker.remove();
                        setTempMarker(null);
                      }
                      setNewPinLat("");
                      setNewPinLng("");
                      setNewPinName("");
                      setSelectedCountry("");
                      setSelectedCity(false);
                      setSearchCities([]);
                    }}
                    className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      addCustomPin();

                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Save Location
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <MapControls
            timeFormat={timeFormat}
            showTimeFormat={timeFormat}
            onToggleSunAndMoon={(show) => { setShowSunAndMoon(show) }}
            onTimeFormatChange={(format) => setTimeFormat(format)}
            showSunAndMoonPosition={showSunAndMoon}
            showDayNightOverlay={showDayNightOverlay}
            setShowDayNightOverlay={(show) => setShowDayNightOverlay(show)}
            showEarthQuakesData={showEarthquakes}
            onToggleEarthquakes={(show) => setShowEarthquakes(show)}
            headerCities={headerCities}
            onHeaderCitiesChange={setHeaderCities}
          />
        </div>
      </div>
    </div>
  );
};

export default WorldMap;