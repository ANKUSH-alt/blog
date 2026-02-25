"use client"

import AdminSidebar from "@/components/admin/sidebar"
import { motion } from "framer-motion"
import { FileText, Users, Eye, TrendingUp } from "lucide-react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: "Total Blogs", value: "0", icon: FileText, change: "+0%" },
        { label: "Active Users", value: "0", icon: Users, change: "+0%" },
        { label: "Blog Views", value: "0", icon: Eye, change: "+0%" },
        { label: "Engagement", value: "0%", icon: TrendingUp, change: "+0%" },
    ])
    const [recentBlogs, setRecentBlogs] = useState<any[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsRes = await fetch(`${API_URL}/blogs/stats`)
                const statsData = await statsRes.json()
                setStats([
                    { label: "Total Blogs", value: statsData.total_blogs.toString(), icon: FileText, change: "+5%" },
                    { label: "Active Users", value: statsData.active_users.toString(), icon: Users, change: "+2%" },
                    { label: "Blog Views", value: statsData.blog_views, icon: Eye, change: "+10%" },
                    { label: "Engagement", value: statsData.engagement, icon: TrendingUp, change: "+1%" },
                ])

                const blogsRes = await fetch(`${API_URL}/blogs/?limit=5`)
                const blogsData = await blogsRes.json()
                setRecentBlogs(blogsData)
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                        <p className="text-muted-foreground">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
                    </div>
                    <Link href="/admin/generate">
                        <button className="px-6 py-2 rounded-lg ai-gradient text-white font-semibold">
                            Generate New Blog
                        </button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card p-8">
                        <h3 className="text-xl font-bold mb-6">Recent Blogs</h3>
                        <div className="space-y-4">
                            {recentBlogs.map((blog: any) => (
                                <div key={blog._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground uppercase">
                                            {blog.category.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{blog.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {blog.is_published ? "Published" : "Draft"} • {blog.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-xs font-bold text-primary px-3 py-1 rounded bg-primary/10">Edit</button>
                                        <button className="text-xs font-bold text-destructive px-3 py-1 rounded bg-destructive/10">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6">System Health</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Server Status", status: "Operational", color: "text-green-500" },
                                { label: "Database", status: "Healthy", color: "text-green-500" },
                                { label: "OpenAI API", status: "Low Latency", color: "text-blue-500" },
                                { label: "Redis Caching", status: "Active", color: "text-green-500" },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
