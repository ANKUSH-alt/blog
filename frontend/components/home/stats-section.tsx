"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

function AnimatedCounter({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    useEffect(() => {
        if (!isInView) return

        let startTime: number
        let animationFrame: number

        const updateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = (timestamp - startTime) / (duration * 1000)

            if (progress < 1) {
                // Ease out expo formula
                const easeOutExpo = 1 - Math.pow(2, -10 * progress)
                setCount(Math.floor(end * easeOutExpo))
                animationFrame = requestAnimationFrame(updateCount)
            } else {
                setCount(end)
            }
        }

        animationFrame = requestAnimationFrame(updateCount)

        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration, isInView])

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    )
}

export default function StatsSection() {
    const stats = [
        { value: 10000, suffix: "+", label: "Active Users", desc: "Learning daily" },
        { value: 500, suffix: "+", label: "AI Articles", desc: "Written by experts" },
        { value: 100, suffix: "+", label: "AI Projects", desc: "Deployed to prod" },
        { value: 50, suffix: "+", label: "AI Tools", desc: "Integrated natively" }
    ]

    return (
        <section className="py-24 bg-secondary/30 border-y border-border relative overflow-hidden">
            {/* Subtle Gradient Backglow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[200px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-4 z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="flex flex-col items-center text-center space-y-2 group"
                        >
                            <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 group-hover:from-primary group-hover:to-purple-500 transition-all duration-500">
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                            </div>
                            <h4 className="text-lg font-bold text-foreground tracking-wide uppercase">{stat.label}</h4>
                            <p className="text-sm text-muted-foreground">{stat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
