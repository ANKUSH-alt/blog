import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { API_URL } from "@/lib/api"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // On successful OAuth, register/login the user with our FastAPI backend
            try {
                const res = await fetch(`${API_URL}/auth/oauth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        provider: account?.provider,
                        provider_id: account?.providerAccountId,
                        avatar: user.image,
                    }),
                })
                if (!res.ok) return false
                const data = await res.json()
                // Store our JWT token on the user object so we can access it later
                user.backendToken = data.access_token
                return true
            } catch {
                return false
            }
        },
        async jwt({ token, user }) {
            if (user?.backendToken) {
                token.backendToken = user.backendToken
            }
            return token
        },
        async session({ session, token }) {
            session.backendToken = token.backendToken as string
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
})
