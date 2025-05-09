"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

  return (
    <div className={`${className} relative min-w-[5ch] flex justify-center`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`time-${format}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          {time}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

