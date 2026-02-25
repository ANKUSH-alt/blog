"use client"

import { motion } from "framer-motion"
import { Bot, FileText, Code, Map, GraduationCap, Zap } from "lucide-react"

export default function FeaturesSection() {
    const features = [
        {
            icon: FileText,
            title: "AI Blog Writer",
            desc: "Generate full-length, SEO-optimized technical articles with a single topic prompt.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Code,
            title: "AI Code Explainer",
            desc: "Paste complex Python or TS code and get line-by-line elite-level breakdowns.",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            icon: Bot,
            title: "AI Tutor Chatbot",
            desc: "Stuck on concepts? Chat with an interactive 24/7 specialized AI coding tutor.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: Zap,
            title: "AI Quiz Generator",
            desc: "Test your knowledge dynamically with progressively difficult AI-generated quizzes.",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            icon: Map,
            title: "Learning Roadmap",
            desc: "Follow a highly-structured path from complete beginner basics to building LLMs.",
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
        {
            icon: GraduationCap,
            title: "Elite Mentorship",
            desc: "Access premium insights usually gatekept by senior engineers in big tech.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ]

    return (
        <section className="py-32 relative bg-background border-t border-b border-border z-10">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />

            <div className="container relative mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block"
                    >
                        Powerful Features
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Accelerate Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Learning Curve</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Utilize Next-Generation AI tools to practice coding, test your knowledge, and build real-world applications instantly.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="group relative p-8 rounded-2xl glass-card border border-border bg-secondary/20 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(var(--primary),0.1)] overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-white/5 ${feat.bg} group-hover:scale-110 transition-transform duration-500`}>
                                <feat.icon className={`w-7 h-7 ${feat.color}`} />
                            </div>

                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feat.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {feat.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
