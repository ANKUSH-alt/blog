"use client"

import AdminSidebar from "@/components/admin/sidebar"
import { motion } from "framer-motion"
import { Users, Shield, Mail, Calendar, MoreVertical, Search, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api"

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(`${API_URL}/auth/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch users")
                }

                const data = await response.json()
                setUsers(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="text-primary w-8 h-8" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">Manage accounts, roles, and platform permissions.</p>
                </header>

                <div className="glass-card mb-8 p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No users found matching &quot;{searchTerm}&quot;
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <tr key={user.id || user._id || user.email} className="hover:bg-secondary/20 transition-colors border-b border-border/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-sm">{user.name}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" /> {user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'
                                                }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {user.status !== 'pending' ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5 text-yellow-500" />
                                                )}
                                                <span className="text-xs capitalize">{user.status || 'active'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                            {user.joined || user.created_at ? new Date(user.joined || user.created_at).toLocaleDateString() : 'New'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
