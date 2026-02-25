"use client"

import { motion } from "framer-motion"
import { ArrowRight, Bot, Cpu, Rocket } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Hero() {
    const [mounted, setMounted] = useState(false)
    const [particles, setParticles] = useState<Array<{ x: string, y: string, duration: number }>>([])

    useEffect(() => {
        setTimeout(() => setMounted(true), 0)
        setParticles([...Array(20)].map(() => ({
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            duration: Math.random() * 5 + 5
        })))
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
            {/* Background Particles Mockup */}
            <div className="absolute inset-0 z-0">
                {mounted && particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 bg-white/20 rounded-full"
                        initial={{
                            x: p.x,
                            y: p.y,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, "-20%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 inline-block">
                        Revolutionizing AI Education
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        Welcome to <br /> AI Era Academy
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        From Python Beginner to LLM Model Builder. Master the future of technology with our structured learning paths and AI-powered platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/courses">
                            <button className="px-8 py-3 rounded-lg ai-gradient text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform ai-glow">
                                Start Learning <Rocket className="w-4 h-4" />
                            </button>
                        </Link>
                        <Link href="/blog">
                            <button className="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold border border-border hover:bg-muted transition-colors flex items-center gap-2">
                                Explore Blog <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Section Mockup */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    {[
                        { label: "Active Students", value: "10K+", icon: Bot },
                        { label: "AI Models Built", value: "500+", icon: Cpu },
                        { label: "Blog Articles", value: "200+", icon: Rocket },
                        { label: "Courses", value: "15+", icon: Cpu },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <stat.icon className="w-6 h-6 text-primary mb-2" />
                            <span className="text-2xl font-bold">{stat.value}</span>
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Hero Visual Effect */}
            <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-1" />
        </section>
    )
}
