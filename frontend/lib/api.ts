// Shared API base URL - uses environment variable in production, falls back to localhost in dev
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
