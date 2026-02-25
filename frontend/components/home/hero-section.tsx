"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Rocket, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HeroSection() {
    const [mounted, setMounted] = useState(false)
    const [particles, setParticles] = useState<Array<{ x: number, y: number, opacity: number, xTo: number, yTo: number, opacityTo: number, duration: number }>>([])

    useEffect(() => {
        setTimeout(() => setMounted(true), 0)

        // Calculate random values once on mount to respect React component purity rules
        const newParticles = [...Array(30)].map(() => ({
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.1,
            yTo: Math.random() * -200 - 50,
            xTo: Math.random() * 100 - 50,
            opacityTo: Math.random() * 0.8 + 0.2,
            duration: Math.random() * 10 + 10
        }))
        setParticles(newParticles)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
            {/* Background Neural Network / Particle Animation */}
            <div className="absolute inset-0 z-0 opacity-30">
                {mounted && particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-[2px] w-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                        initial={{
                            x: p.x,
                            y: p.y,
                            opacity: p.opacity
                        }}
                        animate={{
                            y: [null, p.yTo],
                            x: [null, p.xTo],
                            opacity: [null, p.opacityTo, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background z-10" />
            </div>

            <div className="container relative z-20 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 shadow-[0_0_20px_rgba(var(--primary),0.15)] backdrop-blur-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>The Ultimate AI Learning Platform</span>
                    </motion.div>

                    <h1 className="text-7xl md:text-8xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                        Learn AI From Scratch to <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x">
                            Genretive AI
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Join the next generation of AI Engineers. Master Python, deep learning, and build production-ready LLMs with our interactive AI-powered ecosystem.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-4 rounded-xl ai-gradient text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all ai-glow shadow-[0_0_30px_rgba(var(--primary),0.4)] group">
                                Start Learning <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/blog" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-4 rounded-xl bg-secondary/80 backdrop-blur-md text-foreground font-bold text-lg border border-border hover:bg-muted hover:border-primary/50 transition-all flex items-center justify-center gap-3 group">
                                <BrainCircuit className="w-5 h-5 text-primary" /> Explore AI Blogs
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
