"use client"

import { useState, useEffect } from "react"

interface CityTimeDisplayProps {
  timezone: string
  className?: string
  showSeconds?: boolean
  format?: "12h" | "24h"
}

export default function CityTimeDisplay({
  timezone,
  className = "",
  showSeconds = false,
  format = "24h",
}: CityTimeDisplayProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          ...(showSeconds ? { second: "2-digit" } : {}),
          hour12: format === "12h",
          timeZone: timezone,
        }

        const formatter = new Intl.DateTimeFormat("en-US", options)
        setTime(formatter.format(new Date()))
      } catch (error) {
        console.error("Error formatting time:", error)
        setTime("--:--")
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [timezone, showSeconds, format])

  return <div className={className}>{time}</div>
}

