"use client"

import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api"

interface Blog {
    id: number
    title: string
    slug: string
    category: string
    content: string
    tags: string[]
    seo_title: string
    seo_description: string
    is_published: boolean
    created_at: string
}

export default function BlogListing() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(`${API_URL}/blogs/`)
                const data = await response.json()
                setBlogs(data)
            } catch (error) {
                console.error("Failed to fetch blogs:", error)
            }
        }
        fetchBlogs()
    }, [])

    const categories = ["All", ...Array.from(new Set(blogs.map(b => b.category)))]

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = activeCategory === "All" || blog.category === activeCategory
        return matchesSearch && matchesCategory
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        })
    }

    return (
        <main className="min-h-screen pt-24">
            <Navbar />
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">AI Era <span className="text-primary">Blog</span></h1>
                    <p className="text-muted-foreground text-lg">Insights, tutorials, and latest trends in Artificial Intelligence.</p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-lg border border-border text-sm whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? "bg-primary text-white border-primary"
                                    : "bg-secondary hover:bg-muted"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {filteredBlogs.map((blog: any, i) => (
                        <motion.div
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
                        >
                            <div className="p-6 flex-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">{blog.category}</span>
                                <Link href={`/blog/${blog.slug}`}>
                                    <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors leading-tight">
                                        {blog.title}
                                    </h3>
                                </Link>
                                <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                                    {blog.seo_description || blog.content.substring(0, 100) + "..."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-border bg-muted/50 flex items-center justify-between text-xs">
                                <span>{formatDate(blog.created_at)}</span>
                                <Link href={`/blog/${blog.slug}`} className="font-bold text-primary flex items-center gap-1">
                                    Read More
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                    {filteredBlogs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No blogs found. Try a different search term or category.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
