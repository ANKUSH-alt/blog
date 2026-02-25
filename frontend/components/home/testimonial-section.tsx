"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

export default function TestimonialSection() {
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "Software Engineer @ TechCorp",
            content: "AI Era Academy completely changed the way I approach coding. The AI Tutor explained complex ML equations in a way no YouTube tutorial ever could.",
            avatar: "SJ"
        },
        {
            name: "David Chen",
            role: "Computer Science Student",
            content: "The progression from basic Python to building actual LLMs is incredible. The integrated coding playground means I never have to leave the platform.",
            avatar: "DC"
        },
        {
            name: "Elena Rodriguez",
            role: "Data Scientist",
            content: "The SEO and Blog generation tools built into the platform are production-ready. I use them daily for my own projects. 10/10 experience.",
            avatar: "ER"
        },
        {
            name: "Michael Chang",
            role: "Self-Taught Developer",
            content: "I was intimidated by Deep Learning. The step-by-step roadmap and the AI Code Explainer broke down the barriers. I just deployed my first vision model!",
            avatar: "MC"
        }
    ]

    return (
        <section className="py-24 bg-secondary/20 relative overflow-hidden border-b border-border">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold mb-4"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        <span>Loved by 10,000+ Students</span>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl font-medium mb-8"
                    >
                        &quot;The personalized AI tutor is a game-changer. It feels like having an expert available 24/7 to explain complex concepts.&quot;
                    </motion.p>
                </div>

                {/* CSS Marquee Animation Container */}
                <div className="relative w-full overflow-hidden flex flex-col gap-6 mask-image-fade">

                    {/* First Marquee Track (Left) */}
                    <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
                        {/* Duplicate the array to create an infinite loop effect */}
                        {[...testimonials, ...testimonials].map((test, i) => (
                            <div
                                key={i}
                                className="w-[350px] md:w-[450px] p-8 glass-card border flex-shrink-0 border-border bg-background/50 backdrop-blur-md rounded-2xl relative group"
                            >
                                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />

                                <div className="flex items-center gap-1 mb-6 text-yellow-500">
                                    {[...Array(5)].map((_, star) => (
                                        <Star key={star} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>

                                <p className="text-muted-foreground mb-8 text-sm leading-relaxed min-h-[80px]">
                                    &quot;{test.content}&quot;
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full ai-gradient text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                        {test.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{test.name}</h4>
                                        <p className="text-xs text-muted-foreground">{test.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Standard CSS added inline for the marquee animation and fade masking */}
            <style jsx global>{`
                .mask-image-fade {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); } /* 12px is half the gap */
                }
                
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </section>
    )
}
