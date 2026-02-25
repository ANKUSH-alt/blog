"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

export default function RoadmapSection() {
    const steps = [
        {
            title: "Python Fundamentals",
            desc: "Master the syntax, data structures, OOP, and functional programming concepts.",
            badge: "Phase 1"
        },
        {
            title: "Mathematics for AI",
            desc: "Understand Linear Algebra, Calculus, Probability, and Statistics required for ML.",
            badge: "Phase 2"
        },
        {
            title: "Machine Learning Concepts",
            desc: "Dive into Supervised/Unsupervised learning, regressions, and classifications.",
            badge: "Phase 3"
        },
        {
            title: "Deep Learning Architectures",
            desc: "Build Neural Networks, CNNs for Vision, and RNN/LSTMs for sequence data.",
            badge: "Phase 4"
        },
        {
            title: "Generative AI Models",
            desc: "Explore GANs, Variational Autoencoders (VAEs), and Diffusion mechanics.",
            badge: "Phase 5"
        },
        {
            title: "LLM Engineering",
            desc: "Train, fine-tune, optimize, and deploy custom Large Language Models to production.",
            badge: "Phase 6"
        }
    ]

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 z-0" />

            <div className="container relative z-10 mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Your Path to <span className="text-primary">AI Mastery</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Follow our highly-structured, vertically integrated curriculum designed to take you from a complete beginner to an elite AI architect.
                    </motion.p>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Central Vertical Animated Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-border -translate-x-1/2 hidden md:block">
                        <motion.div
                            className="w-full bg-primary origin-top"
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ height: '100%' }}
                        />
                    </div>

                    <div className="space-y-12">
                        {steps.map((step, i) => (
                            <div key={i} className={`flex flex-col md:flex-row items-center justify-between ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                {/* Empty spacer for the alternating layout */}
                                <div className="hidden md:block w-1/2" />

                                {/* Center Node */}
                                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-background border-4 border-primary z-20 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                                    <span className="text-foreground font-black">{i + 1}</span>
                                </div>

                                {/* Content Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className={`w-full md:w-5/12 ml-6 md:ml-0 p-8 rounded-2xl glass-card border border-border bg-secondary/30 hover:border-primary/50 transition-colors relative group`}
                                >
                                    {/* Mobile Number indicators */}
                                    <div className="md:hidden absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg">
                                        {i + 1}
                                    </div>

                                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                                        {step.badge}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>

                                    {/* Hover gradient line */}
                                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500 rounded-b-2xl" />
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:flex justify-center mt-12 relative z-20">
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-primary/20 p-4 rounded-full text-primary"
                        >
                            <ArrowDown className="w-6 h-6" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
