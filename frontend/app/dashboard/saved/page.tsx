"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion } from "framer-motion"
import { Bookmark, BookOpen, Video, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const INITIAL_SAVED = [
    { id: 1, title: "Understanding Transformer Architectures", type: "Blog", category: "LLM Engineering", slug: "/blog/llm-builder-guide", icon: BookOpen },
    { id: 3, title: "Neural Networks Explained", type: "Blog", category: "Deep Learning", slug: "/blog/neural-networks-intro", icon: BookOpen },
    { id: 5, title: "Mathematics for Machine Learning", type: "Blog", category: "Math", slug: "/blog/math-for-ml", icon: BookOpen },
]

export default function SavedPage() {
    const [saved, setSaved] = useState(INITIAL_SAVED)

    const handleRemove = (id: number) => {
        setSaved(saved.filter(item => item.id !== id))
    }

    return (
        <div className="flex min-h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Saved Items</h1>
                    <p className="text-muted-foreground">Your bookmarked articles and lessons.</p>
                </header>

                <div className="max-w-3xl">
                    {saved.length === 0 ? (
                        <div className="text-center py-20">
                            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-muted-foreground">No saved items</h3>
                            <p className="text-sm text-muted-foreground mt-2">Bookmark blogs and lessons to find them here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {saved.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-5 flex items-center gap-5 group hover:border-primary/40 transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={item.slug}>
                                            <p className="font-medium text-sm hover:text-primary transition-colors truncate">{item.title}</p>
                                        </Link>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="px-2 py-0.5 rounded bg-secondary">{item.type}</span>
                                            <span>{item.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={item.slug}>
                                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
