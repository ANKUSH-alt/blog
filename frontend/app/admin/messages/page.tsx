"use client"

import { useState, useEffect } from "react"
import { Mail, CheckCircle, RefreshCcw, Star, Phone } from "lucide-react"
import AdminSidebar from "@/components/admin/sidebar"
import { API_URL } from "@/lib/api"

interface ContactMessage {
    _id: string
    name: string
    email: string
    subject: string
    message: string
    phone?: string
    rating?: number
    status: string
    created_at: string
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")

    const fetchMessages = async () => {
        setLoading(true)
        setFetchError("")
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/contact/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            } else {
                const err = await res.json().catch(() => ({}))
                setFetchError(err.detail || `Error ${res.status}: Could not load messages`)
            }
        } catch (error) {
            console.error(error)
            setFetchError("Network error – make sure the backend is running")
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/contact/${id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                setMessages(messages.map(m => m._id === id ? { ...m, status: "read" } : m))
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black flex items-center gap-3">
                                <Mail className="w-8 h-8 text-primary" />
                                Contact Messages
                            </h1>
                            <p className="text-muted-foreground mt-2">Manage inquiries from the homepage contact form.</p>
                        </div>
                        <button
                            onClick={fetchMessages}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-sm font-medium"
                        >
                            <RefreshCcw className="w-4 h-4" /> Refresh
                        </button>
                    </div>

                    {fetchError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            ⚠️ {fetchError}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-2xl border border-border">
                            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">No Messages Yet</h3>
                            <p className="text-muted-foreground">Messages submitted via the homepage contact form will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`p-6 rounded-2xl glass-card border transition-all ${msg.status === "unread"
                                        ? "border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                        : "border-border bg-secondary/20 opacity-80"
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg">{msg.subject}</h3>
                                                {msg.status === "unread" && (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">New</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm">
                                                    From: <span className="font-semibold">{msg.name}</span> &lt;<a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>&gt;
                                                </p>
                                                {msg.phone && (
                                                    <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <a href={`tel:${msg.phone}`} className="hover:text-foreground transition-colors">{msg.phone}</a>
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Received: {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                            {msg.rating && (
                                                <div className="flex gap-1 mt-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`w-4 h-4 ${star <= msg.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-border stroke-muted-foreground'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {msg.status === "unread" && (
                                            <button
                                                onClick={() => markAsRead(msg._id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg ai-gradient text-white text-sm font-bold shadow-lg ai-glow shrink-0"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Mark as Read
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-4 mt-4 border border-border/50">
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

