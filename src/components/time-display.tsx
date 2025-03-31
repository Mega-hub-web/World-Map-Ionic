"use client"

import { useState, useEffect } from "react"

interface TimeDisplayProps {
  date: Date
  className?: string
  showSeconds?: boolean
  format?: "12h" | "24h"
}

export default function TimeDisplay({ date, className = "", showSeconds = true, format = "24h" }: TimeDisplayProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const formatTime = () => {
      let hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const seconds = date.getSeconds().toString().padStart(2, "0")

      let formattedTime

      if (format === "12h") {
        const period = hours >= 12 ? "PM" : "AM"
        hours = hours % 12 || 12
        formattedTime = `${hours}:${minutes}${showSeconds ? `:${seconds}` : ""} ${period}`
      } else {
        formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}${showSeconds ? `:${seconds}` : ""}`
      }

      setTime(formattedTime)
    }

    formatTime()
  }, [date, format, showSeconds])

  return <div className={className}>{time}</div>
}

