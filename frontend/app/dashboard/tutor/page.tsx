"use client"

import UserSidebar from "@/components/dashboard/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, RefreshCw, Paperclip } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { API_URL } from "@/lib/api"

export default function AITutorChat() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your AI Era Tutor. How can I help you master AI today?" }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = input
        const newMessages = [...messages, { role: "user", content: userMessage }]
        setMessages(newMessages)
        setInput("")
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        setIsTyping(true)

        try {
            const response = await fetch(`${API_URL}/ai/tutor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: newMessages.slice(-6)
                })
            })
            const data = await response.json()
            setMessages([...newMessages, {
                role: "assistant",
                content: data.response
            }])
        } catch (error) {
            setMessages([...newMessages, {
                role: "assistant",
                content: "Sorry, I'm having trouble connecting right now. Please try again."
            }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <UserSidebar />
            <main className="flex-1 flex flex-col h-screen p-8">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">AI Tutor Chat</h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Always Online
                        </p>
                    </div>
                    <button className="p-2 rounded-lg bg-secondary hover:bg-muted text-muted-foreground transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </header>

                <div className="flex-1 glass-card overflow-hidden flex flex-col relative w-full">
                    {/* Chat Container */}
                    <div
                        ref={scrollRef}
                        className="flex-1 py-6 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-border"
                    >
                        <div className="max-w-4xl mx-auto px-6 space-y-6 w-full">
                            <AnimatePresence>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 mt-1 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'ai-gradient text-white' : 'bg-primary text-primary-foreground'
                                            }`}>
                                            {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'assistant'
                                            ? 'bg-secondary/50 border border-border overflow-x-auto'
                                            : 'bg-primary/90 text-primary-foreground rounded-tr-none whitespace-pre-wrap break-words ml-auto'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-invert max-w-none text-sm leading-6 whitespace-pre-wrap">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || "")
                                                                return !inline && match ? (
                                                                    <div className="rounded-md overflow-hidden my-4 border border-white/10 text-[13px] shadow-lg">
                                                                        <div className="bg-white/10 px-4 py-2 text-xs text-white/50 font-mono flex justify-between items-center border-b border-white/5">
                                                                            <span>{match[1]}</span>
                                                                        </div>
                                                                        <SyntaxHighlighter
                                                                            style={vscDarkPlus as any}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{ margin: 0, padding: "1rem", background: "rgba(0,0,0,0.3)" }}
                                                                            {...props}
                                                                        >
                                                                            {String(children).replace(/\n$/, "")}
                                                                        </SyntaxHighlighter>
                                                                    </div>
                                                                ) : (
                                                                    <code className={`rounded px-1.5 py-0.5 text-[13px] font-mono border ${msg.role === 'user' ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' : 'bg-white/10 text-primary'}`} {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-4 text-white pb-2 border-b border-white/10">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-3 text-white">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2 text-white">{children}</h3>,
                                                            p: ({ children }) => <p className="mb-4 last:mb-0 text-muted-foreground leading-relaxed">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                                            li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                                                            a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{children}</a>,
                                                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 p-3 rounded-r-lg">{children}</blockquote>,
                                                            img: ({ src, alt, ...props }) => (
                                                                <span className="block my-6">
                                                                    <img
                                                                        src={src}
                                                                        alt={alt}
                                                                        className="rounded-xl shadow-lg max-w-full border border-white/10 bg-white/5 mx-auto"
                                                                        loading="lazy"
                                                                        {...props}
                                                                        onError={(e) => {
                                                                            // Fallback if image fails to load
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
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full ai-gradient flex items-center justify-center text-white shadow-lg">
                                            <Bot className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="bg-secondary/50 border border-border p-4 rounded-2xl flex gap-2 items-center">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-transparent border-t border-border/10 z-10 w-full mb-2">
                        <div className="max-w-4xl mx-auto w-full">
                            <div className="relative flex items-center bg-black/60 border border-white/20 rounded-full px-4 py-2 hover:border-white/30 transition-colors focus-within:border-white/40 focus-within:bg-black/80 gap-3">
                                <button className="p-2.5 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-primary transition-all flex items-center justify-center flex-shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                </button>
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
                                    placeholder="Ask your tutor anything..."
                                    className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] scrollbar-thin transition-all placeholder:text-zinc-500 text-white min-h-[44px] max-h-[150px] py-3 pr-12 w-full"
                                    rows={1}
                                    style={{ overflowY: "auto" }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isTyping || !input.trim()}
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
            </main>
        </div>
    )
}
