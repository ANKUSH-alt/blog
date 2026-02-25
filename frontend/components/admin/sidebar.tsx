"use client"

import { LayoutDashboard, FileText, Users, LogOut, Bot, Wand2, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AdminSidebar() {
    const [active, setActive] = useState("Dashboard")

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
        { name: "Manage Blogs", icon: FileText, href: "/admin/blogs" },
        { name: "AI Generator", icon: Bot, href: "/admin/generate" },
        { name: "AI Automator", icon: Wand2, href: "/admin/automate" },
        { name: "Users", icon: Users, href: "/admin/users" },
        { name: "Messages", icon: Mail, href: "/admin/messages" },
    ]

    return (
        <aside className="w-64 bg-secondary/30 border-r border-border h-screen sticky top-0 flex flex-col p-6">
            <div className="flex items-center gap-2 font-bold text-xl mb-10">
                <Bot className="w-8 h-8 text-primary" />
                <span>Admin <span className="text-primary">Panel</span></span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setActive(item.name)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active === item.name
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-auto">
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </aside>
    )
}
