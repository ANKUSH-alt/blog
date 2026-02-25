"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function CtaSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-secondary" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            {/* Floating Orbs */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />

            <div className="container relative mx-auto px-4 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto glass-card p-12 md:p-16 rounded-3xl border border-primary/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 ai-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />

                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
                            Ready to build the <br /> future of AI?
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                            Join thousands of developers mastering LLMs, computer vision, and AI engineering on the most advanced interactive platform.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/dashboard">
                                <button className="w-full sm:w-auto px-10 py-4 rounded-xl ai-gradient text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform ai-glow shadow-[0_0_30px_rgba(var(--primary),0.5)]">
                                    Start Your Journey <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
