"use client"

import AdminSidebar from "@/components/admin/sidebar"
import { motion } from "framer-motion"
import { Search, Plus, Edit2, Trash2, Eye, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

export default function ManageBlogs() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    const fetchBlogs = async () => {
        try {
            const response = await fetch(`${API_URL}/blogs/?limit=100`)
            const data = await response.json()
            setBlogs(data)
        } catch (error) {
            console.error("Failed to fetch blogs:", error)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return
        try {
            const res = await fetch(`${API_URL}/blogs/${id}`, { method: "DELETE" })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                alert(`Failed to delete blog: ${err.detail || res.statusText}`)
                return
            }
            // Refresh list from server
            await fetchBlogs()
        } catch (error) {
            console.error("Delete error:", error)
            alert("An error occurred while deleting the blog.")
        }
    }


    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Blogs</h1>
                        <p className="text-muted-foreground">Oversee all your educational content.</p>
                    </div>
                    <Link href="/admin/generate">
                        <button className="px-6 py-2 rounded-lg ai-gradient text-white font-semibold flex items-center gap-2 ai-glow">
                            <Plus className="w-4 h-4" /> New Blog
                        </button>
                    </Link>
                </header>

                <div className="glass-card mb-8 p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search blogs by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary/50"
                        />
                    </div>
                    <button className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredBlogs.map((blog: any) => (
                                <tr key={blog._id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold block">{blog.title}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{blog.slug}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{blog.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${blog.is_published ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                            }`}>
                                            {blog.is_published ? "PUBLISHED" : "DRAFT"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/blog/${blog.slug}`}>
                                                <button className="p-2 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Eye className="w-3.5 h-3.5" /></button>
                                            </Link>
                                            <button className="p-2 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                className="p-2 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
