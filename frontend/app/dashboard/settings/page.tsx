"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion } from "framer-motion"
import { User, Mail, Lock, Bell, Palette, Save, Shield, Camera } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function SettingsPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [profilePicture, setProfilePicture] = useState<string | null>(null)
    const [notifications, setNotifications] = useState(true)
    const [saved, setSaved] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.name) {
                    setName(data.name)
                    setEmail(data.email)
                    if (data.profile_picture) setProfilePicture(data.profile_picture)
                }
            })
            .catch(err => console.error("Failed to fetch user:", err))
    }, [router])

    const handleSave = async () => {
        setError("")
        setIsLoading(true)
        const token = localStorage.getItem("token")

        try {
            const body: any = { name, email }
            if (newPassword) {
                // In a real app, we should verify current password first
                // For now, we'll just send the new password if provided
                body.password = newPassword
            }

            const res = await fetch(`${API_URL}/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || "Failed to update profile")
            }

            setSaved(true)
            setCurrentPassword("")
            setNewPassword("")
            setTimeout(() => setSaved(false), 2000)
        } catch (err: any) {
            setError(err.message)
            console.error("Error updating profile:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError("")
        try {
            const token = localStorage.getItem("token")
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch(`${API_URL}/auth/me/avatar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || "Failed to upload avatar")

            setProfilePicture(data.profile_picture)

            // Dispatch custom event so sidebar can update immediately
            window.dispatchEvent(new Event("avatarUpdated"))
        } catch (err: any) {
            setError(err.message)
            console.error("Error uploading avatar:", err)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences.</p>
                </header>

                <div className="max-w-2xl space-y-8">
                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Information
                        </h3>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-2xl overflow-hidden ai-gradient flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-primary/20">
                                    {profilePicture ? (
                                        <img src={`${API_URL}${profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        name ? name.charAt(0).toUpperCase() : '-'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                    <Camera className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">{isUploading ? "Uploading..." : "Change"}</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{name || "Your Name"}</h4>
                                <p className="text-sm text-muted-foreground">Click the avatar to upload a new profile picture.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> Security
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preferences Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" /> Preferences
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                                <div>
                                    <p className="font-medium text-sm">Email Notifications</p>
                                    <p className="text-xs text-muted-foreground">Receive updates about new blogs and features</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-primary" : "bg-secondary border border-border"}`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? "left-6" : "left-0.5"}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Button */}
                    <div className="flex flex-col items-end gap-3">
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-8 py-3 rounded-xl ai-gradient text-white font-bold ai-glow flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Saving..." : saved ? "✅ Saved!" : <><Save className="w-4 h-4" /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
