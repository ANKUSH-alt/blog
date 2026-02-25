"use client"

import { Bot, Mail, Lock, User, ArrowRight, Github, ShieldCheck, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { API_URL } from "@/lib/api"

export default function SignupPage() {
    const [step, setStep] = useState<"form" | "otp">("form")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)
    const [oauthLoading, setOauthLoading] = useState<string | null>(null)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // Step 1: Fill form → send OTP to email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }
        setLoading(true)
        setError("")
        try {
            // Check if email already exists
            const checkRes = await fetch(`${API_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, purpose: "register" })
            })
            const otpData = await checkRes.json()
            if (otpData.dev_otp) {
                setError(`[DEV MODE] Your OTP is: ${otpData.dev_otp}`)
            }
            setStep("otp")
            setCountdown(60)
            setTimeout(() => otpRefs.current[0]?.focus(), 200)
        } catch (err: any) {
            setError(err.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP → create account
    const handleVerifyAndRegister = async (otpValue: string) => {
        if (otpValue.length !== 6) return
        setLoading(true)
        setError("")
        try {
            // First verify OTP
            const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue, purpose: "register" })
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.detail || "Invalid OTP")

            // OTP verified → register the user
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            })
            if (!regRes.ok) {
                const regData = await regRes.json()
                throw new Error(regData.detail || "Registration failed")
            }

            // Auto-login
            const formData = new URLSearchParams()
            formData.append("username", email)
            formData.append("password", password)
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString()
            })
            if (loginRes.ok) {
                const loginData = await loginRes.json()
                localStorage.setItem("token", loginData.access_token)
            }
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Verification failed")
            setOtp(["", "", "", "", "", ""])
            otpRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const next = [...otp]
        next[index] = value.slice(-1)
        setOtp(next)
        if (value && index < 5) otpRefs.current[index + 1]?.focus()
        if (next.join("").length === 6) {
            setTimeout(() => handleVerifyAndRegister(next.join("")), 100)
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        setError("")
        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, purpose: "register" })
            })
            const data = await res.json()
            if (data.dev_otp) setError(`[DEV MODE] Your OTP is: ${data.dev_otp}`)
            setCountdown(60)
            setOtp(["", "", "", "", "", ""])
        } catch {
            setError("Failed to resend OTP")
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

            <AnimatePresence mode="wait">
                {step === "form" ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md glass-card p-8 shadow-2xl"
                    >
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
                                <Bot className="w-10 h-10 text-primary" />
                                <span>AI Era <span className="text-primary">Academy</span></span>
                            </Link>
                            <h1 className="text-2xl font-bold">Join the Academy</h1>
                            <p className="text-muted-foreground text-sm">Start your journey to AI mastery today</p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-4">
                            {error && (
                                <div className={`p-3 rounded-lg text-sm border ${error.startsWith("[DEV") ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-red-500/10 border-red-500/30 text-red-500"}`}>
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl ai-gradient text-white font-bold ai-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                                ) : (
                                    <>Verify Email <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={async () => { setOauthLoading("github"); await signIn("github", { callbackUrl: "/dashboard" }) }}
                                disabled={!!oauthLoading}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-60">
                                {oauthLoading === "github" ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Github className="w-4 h-4" />}
                                Github
                            </button>
                            <button onClick={async () => { setOauthLoading("google"); await signIn("google", { callbackUrl: "/dashboard" }) }}
                                disabled={!!oauthLoading}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-60">
                                {oauthLoading === "google" ? (
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                Google
                            </button>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground justify-center">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Unlimited access to 50+ free courses</span>
                        </div>

                        <p className="text-center mt-4 text-sm text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="otp"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md glass-card p-8 shadow-2xl"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4 ai-glow">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold">Verify Your Email</h1>
                            <p className="text-muted-foreground text-sm mt-2">
                                We sent your verification code to<br />
                                <span className="text-foreground font-semibold">{email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className={`p-3 rounded-lg text-sm border mb-4 ${error.startsWith("[DEV") ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-red-500/10 border-red-500/30 text-red-500"}`}>
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center mb-8">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { otpRefs.current[i] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-secondary border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => handleVerifyAndRegister(otp.join(""))}
                            disabled={loading || otp.join("").length !== 6}
                            className="w-full py-3 rounded-xl ai-gradient text-white font-bold ai-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                            ) : (
                                <>Verify & Create Account <ShieldCheck className="w-4 h-4" /></>
                            )}
                        </button>

                        <div className="flex items-center justify-between mt-6 text-sm">
                            <button onClick={() => { setStep("form"); setError(""); setOtp(["", "", "", "", "", ""]) }}
                                className="text-muted-foreground hover:text-foreground transition-colors">
                                ← Back
                            </button>
                            <button onClick={handleResend} disabled={countdown > 0 || resendLoading}
                                className="flex items-center gap-1.5 text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-colors">
                                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
