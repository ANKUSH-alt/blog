"use client"

import Navbar from "@/components/navbar"
import MarkdownRenderer from "@/components/markdown-renderer"
import { motion } from "framer-motion"
import { Calendar, User, Tag, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api"

interface Blog {
    id: number
    title: string
    slug: string
    content: string
    category: string
    tags: string[]
    seo_title: string
    seo_description: string
    is_published: boolean
    created_at: string
}

export default function BlogPost() {
    const params = useParams()
    const slug = params.slug as string
    const [blog, setBlog] = useState<Blog | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${API_URL}/blogs/${slug}`)
                if (!response.ok) {
                    throw new Error("Blog not found")
                }
                const data = await response.json()
                setBlog(data)
            } catch (err: any) {
                setError(err.message || "Failed to load blog")
            } finally {
                setLoading(false)
            }
        }
        if (slug) fetchBlog()
    }, [slug])

    if (loading) {
        return (
            <main className="min-h-screen pt-24 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 max-w-4xl flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </main>
        )
    }

    if (error || !blog) {
        return (
            <main className="min-h-screen pt-24 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 max-w-4xl text-center py-20">
                    <h1 className="text-3xl font-bold mb-4">Blog Not Found</h1>
                    <p className="text-muted-foreground mb-8">{error || "The blog you're looking for doesn't exist."}</p>
                    <Link href="/blog" className="text-primary font-bold hover:underline">← Back to Blog</Link>
                </div>
            </main>
        )
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        })
    }

    const readTime = Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200))

    return (
        <main className="min-h-screen pt-24 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold mb-4 inline-block tracking-widest uppercase">
                        {blog.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-10 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">AI Era Academy</span>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">{formatDate(blog.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                            <Tag className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">{readTime} min read</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 md:p-12 md:rounded-3xl border-white/5 relative bg-black/20 font-sans shadow-2xl overflow-hidden">
                        {/* Soft background glow */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
                        <div className="relative z-10 w-full max-w-none">
                            <MarkdownRenderer content={blog.content} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}
