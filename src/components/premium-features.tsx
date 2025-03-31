"use client"

import { useState } from "react"
import { Globe, Cloud, Zap, Shield, BarChart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function PremiumFeatures() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      description: "Full access to all premium features with monthly billing.",
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$89.99",
      period: "per year",
      description: "Save 25% with annual billing. Full access to all premium features.",
      popular: true,
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$249.99",
      period: "one-time payment",
      description: "Pay once and get lifetime access to all premium features.",
      popular: false,
    },
  ]

  const features = [
    {
      name: "Real-time weather data visualization",
      description: "Access global weather patterns, temperature, and precipitation data",
      icon: <Cloud className="h-5 w-5 text-sky-400" />,
    },
    {
      name: "Earthquake activity tracking",
      description: "Monitor seismic activity worldwide with real-time updates",
      icon: <Zap className="h-5 w-5 text-amber-400" />,
    },
    {
      name: "Air traffic and maritime routes",
      description: "Track flights and shipping in real-time across the globe",
      icon: <Globe className="h-5 w-5 text-indigo-400" />,
    },
    {
      name: "High-resolution 4K map support",
      description: "Experience crystal clear maps with support for ultra-high resolution displays",
      icon: <Shield className="h-5 w-5 text-emerald-400" />,
    },
    {
      name: "Advanced time zone management",
      description: "Create custom time zone collections and comparisons",
      icon: <Clock className="h-5 w-5 text-purple-400" />,
    },
    {
      name: "Data export and API access",
      description: "Export data and integrate with other applications via our API",
      icon: <BarChart className="h-5 w-5 text-pink-400" />,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock advanced features and get the most out of your World Time Map experience.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <motion.div key={plan.id} variants={item}>
              <Card
                className={`relative overflow-hidden bg-gray-800 border-gray-700 ${
                  selectedPlan === plan.id ? "ring-2 ring-indigo-500 border-indigo-500" : "hover:border-gray-600"
                } ${plan.popular ? "transform md:-translate-y-4" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-6 translate-y-3">
                      POPULAR
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    className={`w-full ${
                      selectedPlan === plan.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Premium Features Include:</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className="flex items-start p-4 rounded-lg bg-gray-800/80 border border-gray-700/50"
              >
                <div className="mr-4 mt-1 p-2 rounded-full bg-gray-700/50">{feature.icon}</div>
                <div>
                  <h3 className="font-medium text-white">{feature.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            disabled={!selectedPlan}
            className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full"
          >
            Upgrade Now
          </Button>
          <p className="mt-4 text-sm text-gray-400">30-day money-back guarantee. Cancel anytime.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 bg-gray-800/30 border border-gray-700/30 rounded-lg p-6 max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-medium mb-4 text-center text-white">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white">Can I cancel my subscription at any time?</h4>
              <p className="text-sm text-gray-400 mt-1">
                Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to premium
                features until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">How often is the weather data updated?</h4>
              <p className="text-sm text-gray-400 mt-1">
                Our weather data is updated every 15 minutes from multiple global sources to ensure accuracy and
                reliability.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">Is there a limit to how many custom locations I can add?</h4>
              <p className="text-sm text-gray-400 mt-1">
                No, premium users can add unlimited custom locations and save them to their profile for quick access.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">Do I need a high-end device for 4K support?</h4>
              <p className="text-sm text-gray-400 mt-1">
                While 4K maps look best on high-resolution displays, our adaptive technology ensures optimal performance
                on all devices.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

