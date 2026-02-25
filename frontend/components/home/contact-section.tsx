"use client"

import { motion } from "framer-motion"
import { Send, Mail, MapPin, Star } from "lucide-react"
import { useState } from "react"
import { API_URL } from "@/lib/api"

export default function ContactSection() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [rating, setRating] = useState<number>(0)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("loading")

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone") || undefined,
            rating: rating > 0 ? rating : undefined,
            subject: formData.get("subject"),
            message: formData.get("message")
        }

        try {
            const res = await fetch(`${API_URL}/contact/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setStatus("success")
                setRating(0)
                    ; (e.target as HTMLFormElement).reset()
            } else {
                setStatus("error")
            }
        } catch {
            setStatus("error")
        } finally {
            setTimeout(() => setStatus("idle"), 4000)
        }
    }

    return (
        <section className="py-32 relative bg-background border-t border-border" id="contact">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 blur-[150px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        Get In Touch
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-xl mx-auto"
                    >
                        Have questions about our enterprise plans, curriculum, or API access? Send us a message and our team will get back to you immediately.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">

                    {/* Contact Info (Left Side) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Email Us</h4>
                                <p className="text-muted-foreground text-sm">support@aiera.academy</p>
                                <p className="text-muted-foreground text-sm">enterprise@aiera.academy</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Headquarters</h4>
                                <p className="text-muted-foreground text-sm">San Francisco, CA</p>
                                <p className="text-muted-foreground text-sm">Remote worldwide</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl glass-card border border-primary/20 bg-primary/5 mt-12">
                            <h4 className="font-bold text-primary mb-2">Enterprise Support</h4>
                            <p className="text-sm text-muted-foreground">Looking to train your entire engineering team? Contact our sales team for custom deployment options.</p>
                        </div>
                    </motion.div>

                    {/* Contact Form (Right Side) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 glass-card p-8 md:p-10 rounded-3xl border border-border bg-secondary/30 relative"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        placeholder="john@company.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mobile Number (Optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Rate Our Platform (Optional)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-border stroke-muted-foreground'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                <textarea
                                    required
                                    name="message"
                                    rows={5}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Tell us about your project or inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status !== "idle"}
                                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 ${status === "success"
                                    ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                    : "ai-gradient ai-glow hover:scale-[1.02]"
                                    } disabled:opacity-80`}
                            >
                                {status === "idle" && (
                                    <>Send Message <Send className="w-4 h-4 ml-1" /></>
                                )}
                                {status === "loading" && (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                )}
                                {status === "success" && "Message Sent Successfully!"}
                                {status === "error" && "Failed to Send Message!"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
