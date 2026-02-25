"use client"

import Link from "next/link"
import { Bot, Menu, X, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { API_URL } from "@/lib/api"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<{ name: string } | null>(null)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setTimeout(() => setMounted(true), 0)
        const token = localStorage.getItem("token")
        if (token) {
            fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json()
                })
                .then(data => {
                    if (data && data.name) setUser(data)
                })
                .catch(err => console.error(err))
        }
    }, [])

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Blog", href: "/blog" },
        { name: "AI Playground", href: "/playground" },
    ]

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Bot className="w-8 h-8 text-primary" />
                    <span>AI Era <span className="text-primary">Academy</span></span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                            {link.name}
                        </Link>
                    ))}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
                    >
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </button>
                    {user ? (
                        <Link href="/dashboard">
                            <button className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                                Dashboard ({user.name.split(' ')[0]})
                            </button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className="px-4 py-2 rounded-lg ai-gradient text-white text-sm font-semibold hover:scale-105 transition-transform">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-lg bg-secondary hover:bg-muted"
                    >
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 w-full bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium p-2 hover:bg-muted rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <button className="w-full py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
                                Dashboard ({user.name.split(' ')[0]})
                            </button>
                        </Link>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                            <button className="w-full py-3 rounded-lg ai-gradient text-white font-semibold">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}
