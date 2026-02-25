"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion } from "framer-motion"
import { User, Mail, Calendar, BookOpen, Trophy, MessageSquare, Star, Edit2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function ProfilePage() {
    const [user, setUser] = useState<{ name: string; email: string; profile_picture?: string } | null>(null)
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
                if (data.name) setUser(data)
            })
            .catch(err => console.error("Failed to fetch user:", err))
    }, [router])

    return (
        <div className="flex min-h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 mb-8"
                    >
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ai-gradient flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-primary/20 uppercase">
                                {user?.profile_picture ? (
                                    <img src={`${API_URL}${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user ? user.name.charAt(0) : '-'
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold">{user ? user.name : 'Loading...'}</h1>
                                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                            <Mail className="w-3 h-3" /> {user ? user.email : 'Loading...'}
                                        </p>
                                    </div>
                                    <Link href="/dashboard/settings">
                                        <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                                            <Edit2 className="w-3 h-3" /> Edit Profile
                                        </button>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined Feb 2026</span>
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Pro Learner</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Blogs Read", value: "12", icon: Star, color: "text-yellow-400" },
                            { label: "Tutor Sessions", value: "8", icon: MessageSquare, color: "text-green-400" },
                            { label: "Badges", value: "3", icon: Trophy, color: "text-purple-400" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="glass-card p-5 text-center"
                            >
                                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8 mb-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" /> Badges & Achievements
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: "Python Beginner", emoji: "🐍", earned: true },
                                { name: "Fast Learner", emoji: "⚡", earned: true },
                                { name: "AI Explorer", emoji: "🤖", earned: true },
                                { name: "Math Wizard", emoji: "🧮", earned: false },
                                { name: "Code Master", emoji: "💻", earned: false },
                                { name: "LLM Builder", emoji: "🧠", earned: false },
                            ].map((badge) => (
                                <div
                                    key={badge.name}
                                    className={`p-4 rounded-xl border text-center transition-colors ${badge.earned
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border bg-secondary/30 opacity-40"
                                        }`}
                                >
                                    <span className="text-3xl block mb-2">{badge.emoji}</span>
                                    <p className="text-xs font-bold">{badge.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {badge.earned ? "✅ Earned" : "🔒 Locked"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>


                </div>
            </main>
        </div>
    )
}
