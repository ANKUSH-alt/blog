"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion } from "framer-motion"
import { BookOpen, Trophy, Clock, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"

export default function UserDashboard() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)
    const [stats, setStats] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.name) setUser(data)
            })
            .catch(err => console.error("Failed to fetch user:", err))

        fetch(`${API_URL}/dashboard/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch dashboard stats:", err))
    }, [router])

    return (
        <div className="flex min-h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user ? user.name.split(' ')[0] : 'Loading...'}!</h1>
                        <p className="text-muted-foreground text-lg">Continue your journey to becoming an AI Engineer.</p>
                    </div>
                    <div className="flex gap-4">
                        {(user as any)?.role === 'admin' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 font-bold hover:bg-green-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                Go to Admin Section
                            </button>
                        )}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
                            <Trophy className="w-5 h-5" />
                            <span>{stats?.xp ? stats.xp.toLocaleString() : "0"} XP</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <motion.div
                        className="glass-card p-8 flex flex-col items-center justify-center text-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="w-20 h-20 rounded-full ai-gradient flex items-center justify-center mb-4 ai-glow">
                            <Star className="w-10 h-10 text-primary-foreground fill-current" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Next Milestone</h3>
                        <p className="text-muted-foreground text-sm mb-6">Complete 5 more AI Tutor sessions to level up.</p>
                        <button className="w-full py-3 rounded-lg bg-secondary font-bold hover:bg-muted transition-colors">
                            Resume Learning
                        </button>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> Learning Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm border-b border-border pb-4">
                                <span className="font-semibold">Blogs Read</span>
                                <span className="font-bold text-primary">{stats?.lessons_done || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-b border-border pb-4">
                                <span className="font-semibold">Tutor Sessions</span>
                                <span className="font-bold text-primary">{stats?.tutor_sessions || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-b border-border pb-4 border-b-0">
                                <span className="font-semibold">Badges Earned</span>
                                <span className="font-bold text-primary">{stats?.badges || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-8 bg-primary/5 border-primary/20">
                        <h3 className="text-xl font-bold mb-4">AI Tutor is Ready</h3>
                        <p className="text-muted-foreground mb-6">Stuck on a concept? Your personal AI tutor is available 24/7 to explain complex topics.</p>
                        <button
                            onClick={() => router.push('/playground')}
                            className="w-full py-3 rounded-lg ai-gradient text-white font-bold ai-glow hover:scale-[1.02] transition-transform"
                        >
                            Chat with Tutor
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
