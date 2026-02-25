"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion } from "framer-motion"
import { Clock, BookOpen, MessageSquare, Trophy, ChevronRight } from "lucide-react"
import Link from "next/link"

const HISTORY_ITEMS = [
    { id: 1, type: "blog", title: "Read: Building an AI App", date: "Feb 24, 2026", icon: BookOpen, color: "text-blue-400" },
    { id: 2, type: "tutor", title: "AI Tutor: What are neural networks?", date: "Feb 24, 2026", icon: MessageSquare, color: "text-green-400" },
    { id: 3, type: "blog", title: "Read: Advanced Prompt Engineering", date: "Feb 23, 2026", icon: BookOpen, color: "text-blue-400" },
    { id: 4, type: "achievement", title: "Earned Badge: Prompt Master", date: "Feb 23, 2026", icon: Trophy, color: "text-yellow-400" },
    { id: 5, type: "tutor", title: "AI Tutor: Explain backpropagation", date: "Feb 22, 2026", icon: MessageSquare, color: "text-green-400" },
    { id: 6, type: "blog", title: "Started: Introduction to Fine-tuning", date: "Feb 22, 2026", icon: BookOpen, color: "text-blue-400" },
    { id: 7, type: "tutor", title: "AI Tutor: How to use NumPy arrays?", date: "Feb 21, 2026", icon: MessageSquare, color: "text-green-400" },
    { id: 8, type: "blog", title: "Read: Python for Beginners", date: "Feb 20, 2026", icon: BookOpen, color: "text-blue-400" },
]

export default function HistoryPage() {
    return (
        <div className="flex min-h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Learning History</h1>
                    <p className="text-muted-foreground">Track your learning journey and activity timeline.</p>
                </header>

                <div className="max-w-3xl">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        {[
                            { label: "Blogs Read", value: "12", icon: BookOpen },
                            { label: "Tutor Sessions", value: "8", icon: MessageSquare },
                            { label: "Badges Earned", value: "3", icon: Trophy },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-5 text-center"
                            >
                                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="relative space-y-1">
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />

                        {HISTORY_ITEMS.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative flex items-center gap-5 p-4 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center z-10 group-hover:border-primary/50 transition-colors">
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" /> {item.date}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
