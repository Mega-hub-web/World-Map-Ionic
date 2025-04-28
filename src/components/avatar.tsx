"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ImageIcon, Upload, UserCircle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { postData } from "@/servics/apiService"

interface AvatarProps {
    path?: string
    onUpload: (path: string) => void
}

export function Avatar({ path, onUpload }: AvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
    const [isHovering, setIsHovering] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (path) {
            downloadImage(path)
        }
    }, [path])

    const downloadImage = async (path: string) => {
        try {
            // In a real app, you would fetch the image from your storage
            setAvatarUrl(path)
        } catch (error: any) {
            console.error("Error downloading image: ", error.message)
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        // setIsUploading(true); // Add a state to indicate the upload process

        try {
            const response = await postData("admins/upload/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Avatar uploaded successfully:", response.avatar);
            toast.success("Avatar uploaded successfully!");

            // Update the avatar URL in the parent component
            setAvatarUrl(response.avatar);
            onUpload(response.avatar); // Pass the uploaded avatar URL to the parent component
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error("Error uploading avatar. Please try again.");
        } finally {
            // setIsUploading(false); // Reset the upload state
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            <motion.div
                className="relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div
                    onClick={openFileDialog}
                    className="w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center bg-gray-800"
                >
                    {avatarUrl ? (
                        <img src={"http://localhost:5001" + avatarUrl || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle className="w-20 h-20 text-gray-400" />
                    )}
                </div>

                {/* Overlay on hover */}
                {isHovering && (
                    <motion.div
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={openFileDialog}
                    >
                        <Upload className="w-8 h-8 text-white mb-1" />
                        <span className="text-xs text-white font-medium">Choose File</span>
                    </motion.div>
                )}

                {/* Glowing ring effect */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-70 blur-sm -z-10"></div>
            </motion.div>

            <div className="flex items-center">
                <button
                    onClick={openFileDialog}
                    className="text-xs flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    <ImageIcon className="w-3 h-3" />
                    <span>{avatarUrl ? "Change Photo" : "Choose Photo"}</span>
                </button>
            </div>

            <p className="text-xs text-gray-500 text-center max-w-[200px]">Click on the circle to select a profile picture</p>
        </div>
    )
}
