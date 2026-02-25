import { DefaultSession, DefaultJWT } from "next-auth"

// Extend the built-in session types to include our custom backendToken field
declare module "next-auth" {
    interface Session extends DefaultSession {
        backendToken: string
    }
    interface User {
        backendToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        backendToken?: string
    }
}
