"use client"

import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Image as ImageIcon, MessageSquare, Terminal, Zap, Bot, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { API_URL } from "@/lib/api"

type Message = { role: "system" | "user" | "ai", content: string }

export default function AIPlayground() {
    const [activeTab, setActiveTab] = useState("chat")
    const [input, setInput] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "Playground sandbox initialized. Select a tool and enter a prompt to test the OpenRouter model." }
    ])

    const terminalRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [messages])

    const tools = [
        { id: "chat", name: "AI Chat", icon: MessageSquare, desc: "Global reasoning & knowledge base." },
        { id: "code", name: "Code Explainer", icon: Terminal, desc: "Logic analysis & bug detection." },
        { id: "image", name: "Image Gen", icon: ImageIcon, desc: "DALL-E 3 & Stable Diffusion tools." },
        { id: "analysis", name: "Model Analysis", icon: Cpu, desc: "Token density & latency benchmarks." }
    ]

    const handleRun = async () => {
        if (!input.trim() || isProcessing) return

        const currentInput = input
        setIsProcessing(true)
        setInput("")
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        setMessages(prev => [...prev, { role: "user", content: currentInput }])

        try {
            let systemPrompt = "You are a helpful AI assistant."
            if (activeTab === "code") systemPrompt = "You are an expert software engineer and code explainer. Analyze the logic and provide concise, code-focused answers."
            if (activeTab === "image") systemPrompt = "You are an AI image prompt generator. Describe the requested image in extreme detail as if creating a prompt for Stable Diffusion or Midjourney. Only output the prompt description."
            if (activeTab === "analysis") systemPrompt = "You are an AI data scientist. Analyze the request and provide simulated realistic benchmarks, token density, and latency metrics."

            const historyToPass = messages
                .filter(m => m.role === "user" || m.role === "ai")
                .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }))

            let response;
            let isUnsplash = false;
            let unsplashData = null;

            if (activeTab === "image") {
                const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
                const query = encodeURIComponent(currentInput);
                response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${accessKey}`);
                isUnsplash = true;
            } else {
                response = await fetch(`${API_URL}/ai/assistant`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: currentInput,
                        history: historyToPass,
                        system_prompt: systemPrompt
                    })
                });
            }

            if (!response.ok) throw new Error("API request failed")

            const data = await response.json()

            let textResponse = "";
            if (activeTab === "image") {
                textResponse = `**Query:** ${currentInput}\n\n![Generated Image](${data.urls?.regular || data[0]?.urls?.regular || "Error fetching image"})`;
            } else {
                textResponse = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
            }

            setMessages(prev => [...prev, { role: "ai", content: textResponse }])
        } catch (error: any) {
            console.error("API Error details:", error);
            setMessages(prev => [...prev, { role: "system", content: `Error: ${error.message || "Model inference failed. Ensure backend API is online."}` }])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleTabChange = (toolId: string) => {
        setActiveTab(toolId)
        setMessages([
            { role: "system", content: `Switched to **${tools.find(t => t.id === toolId)?.name}** module.\n\nReady for input.` }
        ])
    }

    return (
        <main className="min-h-screen pt-24 pb-20 overflow-x-hidden relative bg-background">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">AI <span className="text-primary font-black">Playground</span></h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Interactive sandbox to test, explore, and benchmark modern AI capabilities dynamically.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:h-[700px]">
                    {/* Sidebar Menu */}
                    <div className="lg:col-span-1 space-y-4">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => handleTabChange(tool.id)}
                                    className={`w-full p-5 rounded-2xl text-left border transition-all relative overflow-hidden group ${activeTab === tool.id
                                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20'
                                        : 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/60'
                                        }`}
                                >
                                    {activeTab === tool.id && (
                                        <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                    )}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${activeTab === tool.id ? 'bg-primary/20' : 'bg-muted group-hover:bg-muted/80'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold">{tool.name}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed opacity-80">{tool.desc}</p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Playground Sandbox Area */}
                    <div className="lg:col-span-3 h-[600px] lg:h-full flex flex-col w-full max-w-full">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card flex-1 flex flex-col overflow-hidden relative border-primary/20 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

                            {/* Header */}
                            <div className="p-4 border-b border-border/50 bg-black/40 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        {(() => {
                                            const tool = tools.find(t => t.id === activeTab);
                                            if (!tool) return null;
                                            const Icon = tool.icon;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="font-bold flex items-center gap-2">
                                            {tools.find(t => t.id === activeTab)?.name} Engine
                                        </h2>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Connection: Active
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                            </div>

                            {/* Terminal / Chat Area */}
                            <div
                                ref={terminalRef}
                                className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent z-10"
                            >
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' :
                                                msg.role === 'ai' ? 'ai-gradient text-white' :
                                                    'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                                }`}>
                                                {msg.role === 'user' ? <User className="w-4 h-4" /> :
                                                    msg.role === 'ai' ? <Bot className="w-4 h-4" /> :
                                                        <Terminal className="w-4 h-4" />}
                                            </div>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-primary/90 text-primary-foreground rounded-tr-none whitespace-pre-wrap break-words' :
                                                msg.role === 'ai' ? 'bg-secondary/80 border border-border text-foreground rounded-tl-none overflow-x-auto backdrop-blur-sm break-words' :
                                                    'bg-[#0a0a0a] border border-zinc-800 text-green-400 font-mono text-xs rounded-tl-none break-words whitespace-pre-wrap'
                                                }`}>
                                                {msg.role === 'user' || msg.role === 'system' ? (
                                                    msg.content
                                                ) : (
                                                    <div className="prose prose-invert max-w-none text-sm leading-6 whitespace-pre-wrap break-words">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ node, inline, className, children, ...props }: any) {
                                                                    const match = /language-(\w+)/.exec(className || "")
                                                                    return !inline && match ? (
                                                                        <div className="rounded-md overflow-hidden my-4 border border-white/10 text-[13px] shadow-2xl">
                                                                            <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 text-xs text-zinc-400 font-mono flex items-center justify-between border-b border-white/5">
                                                                                <span className="flex items-center gap-2">
                                                                                    <Terminal className="w-3 h-3" /> {match[1]}
                                                                                </span>
                                                                            </div>
                                                                            <SyntaxHighlighter
                                                                                style={vscDarkPlus as any}
                                                                                language={match[1]}
                                                                                PreTag="div"
                                                                                customStyle={{ margin: 0, padding: "1rem", background: "#0d0d0d", overflowX: "auto" }}
                                                                                {...props}
                                                                            >
                                                                                {String(children).replace(/\n$/, "")}
                                                                            </SyntaxHighlighter>
                                                                        </div>
                                                                    ) : (
                                                                        <code className={`rounded px-1.5 py-0.5 text-[13px] font-mono border ${msg.role === 'user' ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' : 'bg-primary/20 text-primary border-primary/20'}`} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                },
                                                                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
                                                                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-zinc-300">{children}</ul>,
                                                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-zinc-300">{children}</ol>,
                                                                li: ({ children }) => <li className="pl-2 mb-1">{children}</li>,
                                                                strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                                                h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white border-b border-border pb-2">{children}</h1>,
                                                                h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-white">{children}</h2>,
                                                                h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-white">{children}</h3>,
                                                                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg italic text-zinc-400 my-4 shadow-inner">{children}</blockquote>,
                                                                img: ({ src, alt, ...props }) => {
                                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                                    const [imgSrc, setImgSrc] = useState(src);
                                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                                    const [hasError, setHasError] = useState(false);
                                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                                    const [isLoading, setIsLoading] = useState(true);

                                                                    const handleRetry = () => {
                                                                        setIsLoading(true);
                                                                        setHasError(false);
                                                                        if (typeof src === 'string') {
                                                                            setImgSrc(src + (src.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime());
                                                                        }
                                                                    };

                                                                    return (
                                                                        <span className="block my-6 relative min-h-[200px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                                                                            {isLoading && !hasError && (
                                                                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                                                    <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                                                                                    <span className="text-xs text-muted-foreground animate-pulse">Generating rendering...</span>
                                                                                </span>
                                                                            )}

                                                                            {!hasError ? (
                                                                                <img
                                                                                    src={imgSrc}
                                                                                    alt={alt}
                                                                                    className={`rounded-xl shadow-lg max-w-full mx-auto transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                                                                    loading="lazy"
                                                                                    onLoad={() => setIsLoading(false)}
                                                                                    onError={(e) => {
                                                                                        console.error("Failed to load image:", imgSrc);
                                                                                        setHasError(true);
                                                                                        setIsLoading(false);
                                                                                    }}
                                                                                    {...props}
                                                                                />
                                                                            ) : (
                                                                                <span className="flex flex-col items-center justify-center text-center p-8 gap-4 w-full">
                                                                                    <span className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                                                                                        <ImageIcon className="w-8 h-8 text-red-400 opacity-50" />
                                                                                    </span>
                                                                                    <strong className="block text-red-400 font-bold">Generation Timeout / Blocked</strong>
                                                                                    <span className="block text-xs text-zinc-400 max-w-sm">Failed to load generated image: {alt}. The image provider might be rate-limiting.</span>

                                                                                    <button
                                                                                        onClick={handleRetry}
                                                                                        className="mt-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                                                                                    >
                                                                                        <Zap className="w-3 h-3" /> Retry Image Load
                                                                                    </button>
                                                                                </span>
                                                                            )}

                                                                            {!isLoading && !hasError && alt && (
                                                                                <span className="block absolute -bottom-8 left-0 right-0 text-center text-xs text-muted-foreground italic">{alt}</span>
                                                                            )}
                                                                        </span>
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isProcessing && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-primary animate-pulse" />
                                        </div>
                                        <div className="bg-secondary/80 border border-border p-4 rounded-2xl rounded-tl-none flex gap-2 items-center backdrop-blur shadow-sm">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
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
                                                    handleRun();
                                                }
                                            }}
                                            placeholder={
                                                activeTab === "chat" ? "Ask a general AI question..." :
                                                    activeTab === "code" ? "Paste your code snippet or error here..." :
                                                        activeTab === "image" ? "Describe the image you want to generate in detail..." :
                                                            "Enter prompt to analyze..."
                                            }
                                            className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] scrollbar-thin transition-all placeholder:text-zinc-500 text-white min-h-[44px] max-h-[150px] py-3 pr-12 w-full"
                                            rows={1}
                                            style={{ overflowY: "auto" }}
                                        />
                                        <button
                                            onClick={handleRun}
                                            disabled={isProcessing || !input.trim()}
                                            className="absolute right-3 p-2.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-800 transition-all flex items-center justify-center pointer-events-auto"
                                        >
                                            <Zap className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-center mt-4">
                                        <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                                            POWERED BY OPENROUTER LLM NEURAL ENGINE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    )
}
