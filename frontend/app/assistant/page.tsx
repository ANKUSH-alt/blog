"use client"

import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { API_URL } from "@/lib/api"

export default function UserAIAssistant() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your AI Academy Assistant. How can I help you on your AI learning journey today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/ai/assistant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: messages.slice(-5) // Send last 5 messages for context
                })
            })
            const data = await response.json()
            setMessages(prev => [...prev, { role: "assistant", content: data.response }])
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to my neural core right now. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-background relative overflow-hidden">
            <Navbar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 max-w-4xl h-[calc(100vh-180px)] flex flex-col">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="text-primary w-8 h-8" />
                            AI <span className="text-primary">Assistant</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">Your 24/7 personal tutor for all things AI & Data Science.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AI Engine Active (OpenRouter)
                    </div>
                </header>

                {/* Chat Container */}
                <div className="flex-1 glass-card flex flex-col overflow-hidden relative border-primary/20 bg-black/20">
                    <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/20"
                    >
                        <AnimatePresence initial={false}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-primary border border-white/20 text-primary-foreground' : 'bg-secondary border border-border'
                                            }`}>
                                            {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${m.role === 'user'
                                            ? 'bg-primary/90 text-primary-foreground rounded-tr-none whitespace-pre-wrap break-words'
                                            : 'bg-secondary/90 border border-border text-foreground rounded-tl-none overflow-x-auto'
                                            }`}>
                                            {m.role === 'user' ? (
                                                m.content
                                            ) : (
                                                <div className="prose prose-invert max-w-none text-sm leading-6 whitespace-pre-wrap">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || "")
                                                                return !inline && match ? (
                                                                    <div className="rounded-md overflow-hidden my-4 border border-white/10 text-[13px]">
                                                                        <div className="bg-white/10 px-4 py-1 text-xs text-white/50 font-mono flex justify-between items-center">
                                                                            <span>{match[1]}</span>
                                                                        </div>
                                                                        <SyntaxHighlighter
                                                                            style={vscDarkPlus as any}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{ margin: 0, padding: "1rem", background: "rgba(0,0,0,0.5)" }}
                                                                            {...props}
                                                                        >
                                                                            {String(children).replace(/\n$/, "")}
                                                                        </SyntaxHighlighter>
                                                                    </div>
                                                                ) : (
                                                                    <code className={`rounded px-1.5 py-0.5 text-[13px] font-mono border ${m.role === 'user' ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' : 'bg-white/10 text-primary'}`} {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-4 text-white">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-3 text-white">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2 text-white">{children}</h3>,
                                                            p: ({ children }) => <p className="mb-4 last:mb-0 text-muted-foreground leading-relaxed">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                                            li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                                                            a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{children}</a>,
                                                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{children}</blockquote>,
                                                            img: ({ src, alt, ...props }) => (
                                                                <span className="block my-6">
                                                                    <img
                                                                        src={src}
                                                                        alt={alt}
                                                                        className="rounded-xl shadow-lg max-w-full border border-white/10 bg-white/5 mx-auto"
                                                                        loading="lazy"
                                                                        {...props}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            const parent = e.currentTarget.parentElement;
                                                                            if (parent) {
                                                                                parent.innerHTML = `<div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Failed to load generated image: ${alt}</div>`;
                                                                            }
                                                                        }}
                                                                    />
                                                                    {alt && <span className="block text-center text-xs text-muted-foreground mt-2 italic">{alt}</span>}
                                                                </span>
                                                            )
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-secondary/80 border border-border p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-transparent border-t border-border/10 z-10 w-full mb-2">
                        <div className="max-w-4xl mx-auto w-full">
                            <div className="relative flex items-center bg-black/60 border border-white/20 rounded-full px-4 py-2 hover:border-white/30 transition-colors focus-within:border-white/40 focus-within:bg-black/80">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask me anything: 'Explain backpropagation' or 'What is a Transformer?'"
                                    className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] scrollbar-thin transition-all placeholder:text-zinc-500 text-white min-h-[44px] max-h-[150px] py-3 pr-12 w-full"
                                    rows={1}
                                    style={{ overflowY: "auto" }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-3 p-2.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-800 transition-all flex items-center justify-center pointer-events-auto"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-4">
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                                    POWERED BY OPENROUTER LLM NEURAL ENGINE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
