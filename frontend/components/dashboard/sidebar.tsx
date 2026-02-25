"use client"

import { Home, MessageSquare, Heart, Clock, User, Settings as SettingsIcon, LogOut, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { API_URL } from "@/lib/api"

export default function UserSidebar() {
    const [active, setActive] = useState("Dashboard")
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<{ name: string; email: string; profile_picture?: string } | null>(null)
    const { theme, setTheme } = useTheme()

    const fetchUser = () => {
        const token = localStorage.getItem("token")
        if (token) {
            fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.name) setUser(data)
                })
                .catch(err => console.error("Failed to fetch user in sidebar:", err))
        }
    }

    useEffect(() => {
        setMounted(true)
        fetchUser()

        // Listen for profile picture updates from settings page
        window.addEventListener('avatarUpdated', fetchUser)
        return () => window.removeEventListener('avatarUpdated', fetchUser)
    }, [])

    const menuItems = [
        { name: "Dashboard", icon: Home, href: "/dashboard" },
        { name: "AI Tutor", icon: MessageSquare, href: "/dashboard/tutor" },
        { name: "Saved Articles", icon: Heart, href: "/dashboard/saved" },
        { name: "History", icon: Clock, href: "/dashboard/history" },
        { name: "Profile", icon: User, href: "/dashboard/profile" },
    ]

    return (
        <aside className="w-64 bg-secondary/30 border-r border-border h-screen sticky top-0 flex flex-col p-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
                <span className="text-primary font-black text-2xl">AI</span>
                <span>Academy</span>
            </Link>

            {user && (
                <div className="flex items-center gap-3 px-2 py-3 mb-6 bg-background/50 rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                        {user.profile_picture ? (
                            <img src={`${API_URL}${user.profile_picture}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            )}

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setActive(item.name)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active === item.name
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto space-y-2">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                    <span className="flex items-center gap-3">
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                        Theme
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold opacity-50">{mounted ? theme : ''}</span>
                </button>
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                </Link>
                <button
                    onClick={() => {
                        localStorage.removeItem("token")
                        setUser(null)
                        window.location.href = "/login"
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    )
}
