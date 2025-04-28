"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Mail, Lock, UserIcon, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar } from "./avatar"
import { postData } from "../servics/apiService"
import { toast } from "sonner"
import { useIonRouter } from '@ionic/react'

interface LoginModalProps {
  initialView?: "login" | "signup"
  onClose: () => void
}

// Simulated database of existing users
const EXISTING_EMAILS = ["test@example.com", "user@example.com", "admin@example.com"]

type ModalView = "login" | "signup"

export default function LoginModal({ initialView = "login", onClose }: LoginModalProps) {
  const ionRouter = useIonRouter();
  const [currentView, setCurrentView] = useState<ModalView>(initialView)
  const [avatarPath, setAvatarPath] = useState<string | undefined>()
  const [signupEmail, setSignupEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupLocation, setSignupLocation] = useState("");
  const [signupPhone, setSignupPhone] = useState("");


  // Update view if initialView prop changes
  useEffect(() => {
    setCurrentView(initialView)
  }, [initialView])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send login request to the backend
      const response = await postData("/user/login", {
        email: loginEmail,
        password: loginPassword,
      });

      console.log("Login successful:", response);
      localStorage.setItem("authToken", response.token);
      toast.success("Login successful!");
      
      // Use Ionic router to navigate
      ionRouter.push('/map-view');
      onClose(); // Close the modal after successful navigation
      
    } catch (error: any) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError(null);

    if (signupPassword !== signupConfirmPassword) {
      setEmailError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send sign-up request to the backend
      const response = await postData("/user", {
        firstName: signupFirstName,
        lastName: signupLastName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        location: signupLocation,
        avatar: avatarPath, // Include the avatar path
        phone: signupPhone,
      });

      toast.success("Sign-up successful! Please check your email for verification.");
      console.log("Sign-up successful:", response);
      onClose();
    } catch (error: any) {
      toast.error("Sign-up failed. Please try again.");
      console.error("Error during sign-up:", error);
      setEmailError(error.response?.data?.message || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])
  const handleAvatarUpload = (path: string) => {
    setAvatarPath(path)
    // You would typically save this path to your user profile
    console.log("Avatar uploaded:", path)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-10"
        onClick={(e) => {
          // Only close if clicking directly on the backdrop
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative mx-4 my-auto"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Login View */}
          {currentView === "login" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400 mt-1">Sign in to access your account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-gray-400">
                    <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-indigo-600" />
                    <span>Remember me</span>
                  </label>

                  <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <button onClick={() => setCurrentView("signup")} className="text-indigo-400 hover:text-indigo-300">
                  Create one
                </button>
              </div>
            </div>
          )}

          {/* Signup View */}
          {currentView === "signup" && (
            <div className="space-y-6 ">
              <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-gray-400 mt-1">Join us to explore the world in real-time</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Enhanced Avatar upload component */}
                <div className="flex justify-center py-4 mb-2">
                  <Avatar path={avatarPath} onUpload={handleAvatarUpload} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-300">
                    First Name
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="John"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}

                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-300">
                    Last Name
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Doe"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}

                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className={`pl-10 bg-gray-800 border-gray-700 text-white `}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  {/* {emailError && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-red-200 py-2 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs ml-2">{emailError}</AlertDescription>
                    </Alert>
                  )} */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">
                    Location
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="New York, USA"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupLocation}
                      onChange={(e) => setSignupLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      type="text"
                      placeholder="(02) 123-3456"
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-sm text-gray-400">
                  <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-indigo-600" required />
                  <span>I agree to the Terms and Privacy Policy</span>
                </label>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-400 pb-2">
                Already have an account?{" "}
                <button onClick={() => setCurrentView("login")} className="text-indigo-400 hover:text-indigo-300">
                  Sign in
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
