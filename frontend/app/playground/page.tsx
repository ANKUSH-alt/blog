"use client"

import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import {
    MessageSquare, Plus, Mic, MicOff, Paperclip, Download, Send, Square,
    Copy, Check, RefreshCw, Trash2, ChevronDown, Bot, User, Terminal,
    Image as ImageIcon, Zap, PenLine, MoreHorizontal
} from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { API_URL } from "@/lib/api"

type Message = { role: "system" | "user" | "ai", content: string, videoUrl?: string, imageUrl?: string }
type ChatSession = { id: string, title: string, messages: Message[], createdAt: number }

export default function AIPlayground() {
    const [input, setInput] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
    const [activeChatId, setActiveChatId] = useState<string>("")
    const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash-001")
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [currentMode, setCurrentMode] = useState<"chat" | "image" | "video">("chat")

    const terminalRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [attachedFile, setAttachedFile] = useState<File | null>(null)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const models = [
        { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", badge: "Fast" },
        { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro", badge: "Best" },
        { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", badge: "Smart" },
        { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", badge: "Open" },
    ]

    // Initialize first chat
    useEffect(() => {
        if (chatSessions.length === 0) {
            createNewChat()
        }
    }, [])

    const createNewChat = useCallback(() => {
        const newId = `chat-${Date.now()}`
        const newSession: ChatSession = {
            id: newId,
            title: "New chat",
            messages: [],
            createdAt: Date.now()
        }
        setChatSessions(prev => [newSession, ...prev])
        setActiveChatId(newId)
        setMessages([])
        setInput("")
        if (textareaRef.current) textareaRef.current.focus()
    }, [])

    const switchChat = (chatId: string) => {
        // Save current chat
        if (activeChatId) {
            setChatSessions(prev => prev.map(c =>
                c.id === activeChatId ? { ...c, messages } : c
            ))
        }
        const target = chatSessions.find(c => c.id === chatId)
        if (target) {
            setActiveChatId(chatId)
            setMessages(target.messages)
        }
    }

    const deleteChat = (chatId: string) => {
        setChatSessions(prev => prev.filter(c => c.id !== chatId))
        if (activeChatId === chatId) {
            const remaining = chatSessions.filter(c => c.id !== chatId)
            if (remaining.length > 0) {
                setActiveChatId(remaining[0].id)
                setMessages(remaining[0].messages)
            } else {
                createNewChat()
            }
        }
    }

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognitionRef.current = recognition;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (e: any) => {
            let transcript = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                transcript += e.results[i][0].transcript;
            }
            if (e.results[e.results.length - 1].isFinal) {
                setInput(prev => (prev ? prev + ' ' : '') + transcript.trim());
            }
        };
        recognition.start();
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleDownload = async (msg: Message) => {
        try {
            if (msg.videoUrl) {
                const res = await fetch(msg.videoUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `ai-video-${Date.now()}.mp4`; a.click();
                URL.revokeObjectURL(url);
                return;
            }
            const imgMatch = msg.content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
            if (imgMatch) {
                const res = await fetch(imgMatch[1]);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `ai-image-${Date.now()}.jpg`; a.click();
                URL.revokeObjectURL(url);
                return;
            }
            const blob = new Blob([msg.content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `ai-response-${Date.now()}.md`; a.click();
            URL.revokeObjectURL(url);
        } catch (err) { console.error('Download failed:', err); }
    };

    const stopGenerating = () => {
        abortControllerRef.current?.abort();
        setIsProcessing(false);
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [messages])

    // Save messages to active chat session
    useEffect(() => {
        if (activeChatId && messages.length > 0) {
            setChatSessions(prev => prev.map(c =>
                c.id === activeChatId ? {
                    ...c,
                    messages,
                    title: messages.find(m => m.role === "user")?.content.slice(0, 40) || "New chat"
                } : c
            ))
        }
    }, [messages, activeChatId])

    const handleRun = async () => {
        if ((!input.trim() && !attachedFile) || isProcessing) return

        let currentInput = input
        setIsProcessing(true)
        setInput("")
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        // Handle file attachment
        let imageData: string | null = null;
        if (attachedFile) {
            if (attachedFile.type.startsWith("image/")) {
                imageData = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(attachedFile);
                });
            } else {
                try {
                    let fileContent = await attachedFile.text();
                    if (fileContent.length > 50000) {
                        fileContent = fileContent.slice(0, 50000) + "\n\n... [truncated]";
                    }
                    currentInput = `[Attached file: ${attachedFile.name}]\n\n${fileContent}\n\n---\nUser message: ${currentInput}`;
                } catch {
                    currentInput = `[Attached file: ${attachedFile.name}]\n\nUser message: ${currentInput}`;
                }
            }
            setAttachedFile(null);
        }

        setMessages(prev => [...prev, { role: "user", content: input, ...(imageData ? { imageUrl: imageData } : {}) }])

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const isImageRequest = currentMode === "image";
            const isVideoRequest = currentMode === "video";

            if (isImageRequest) {
                setMessages(prev => [...prev, { role: "system", content: "Generating image..." }]);
                const response = await fetch(`${API_URL}/ai/generate-image`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: currentInput }),
                    signal: abortController.signal
                });
                if (!response.ok) {
                    const errBody = await response.text().catch(() => "");
                    throw new Error(`Error: ${response.status} - ${errBody}`);
                }
                const data = await response.json();
                const imageMarkdown = `![${data.prompt || currentInput}](${data.url})\n\n**Prompt:** ${data.prompt || currentInput}`;
                setMessages(prev => {
                    const filtered = prev.filter(m => m.content !== "Generating image...");
                    return [...filtered, { role: "ai", content: imageMarkdown }];
                });
            } else if (isVideoRequest) {
                setMessages(prev => [...prev, { role: "system", content: "Generating video... This typically takes 1-3 minutes." }]);
                const response = await fetch(`${API_URL}/ai/generate-video`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: currentInput }),
                    signal: abortController.signal
                });
                if (!response.ok) {
                    const errBody = await response.text().catch(() => "");
                    throw new Error(`Error: ${response.status} - ${errBody}`);
                }
                const data = await response.json();
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.content.includes("Generating video"));
                    return [...filtered, { role: "ai", content: `**Video generated!**\n\nPrompt: *${currentInput}*`, videoUrl: data.url }];
                });
            } else {
                // Regular AI chat
                const systemPrompt = "You are a helpful AI assistant. You can help with code, analysis, creative writing, and more. Be concise and clear."
                const historyToPass = messages
                    .filter(m => m.role === "user" || m.role === "ai")
                    .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }))

                const requestBody: any = {
                    message: currentInput,
                    history: historyToPass,
                    system_prompt: systemPrompt,
                    model: selectedModel
                };
                if (imageData) requestBody.image_data = imageData;

                const response = await fetch(`${API_URL}/ai/assistant`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                    signal: abortController.signal
                });

                if (!response.ok) {
                    const errBody = await response.text().catch(() => "");
                    throw new Error(`Error: ${response.status} - ${errBody}`);
                }

                const data = await response.json()
                const textResponse = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
                setMessages(prev => [...prev, { role: "ai", content: textResponse }])
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setMessages(prev => [...prev, { role: "system", content: "Generation stopped." }])
            } else {
                console.error("API Error:", error);
                setMessages(prev => [...prev, { role: "system", content: `Error: ${error.message || "Request failed."}` }])
            }
        } finally {
            setIsProcessing(false)
            abortControllerRef.current = null
        }
    }

    const regenerateLastResponse = async () => {
        const lastUserMsgIdx = [...messages].reverse().findIndex(m => m.role === "user");
        if (lastUserMsgIdx === -1) return;
        const actualIdx = messages.length - 1 - lastUserMsgIdx;
        const lastUserMsg = messages[actualIdx];

        // Remove everything after the last user message
        setMessages(prev => prev.slice(0, actualIdx + 1));
        setInput(lastUserMsg.content);

        // Auto-trigger run after state update
        setTimeout(() => {
            const btn = document.getElementById('send-btn');
            btn?.click();
        }, 100);
    };

    const editMessage = (idx: number) => {
        const msg = messages[idx];
        if (msg.role !== "user") return;
        setInput(msg.content);
        setMessages(prev => prev.slice(0, idx));
        textareaRef.current?.focus();
    };

    // Empty state component
    const EmptyState = () => (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 border ${currentMode === 'image' ? 'from-purple-500/20 to-purple-500/5 border-purple-500/10' :
                currentMode === 'video' ? 'from-blue-500/20 to-blue-500/5 border-blue-500/10' :
                    'from-primary/20 to-primary/5 border-primary/10'
                }`}>
                {currentMode === 'image' ? <ImageIcon className="w-8 h-8 text-purple-500" /> :
                    currentMode === 'video' ? <PenLine className="w-8 h-8 text-blue-500" /> :
                        <Zap className="w-8 h-8 text-primary" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
                {currentMode === 'image' ? 'Image Generation' : currentMode === 'video' ? 'Video Generation' : 'What can I help with?'}
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mb-8">
                {currentMode === 'image' ? 'Describe the image you want to create.' :
                    currentMode === 'video' ? 'Describe the video you want to generate. Be specific about motion.' :
                        'Ask me anything — code, analysis, creative writing, or general knowledge.'}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {currentMode === 'chat' && [
                    { text: "Explain quantum computing", icon: "💡" },
                    { text: "Summarize a complex article", icon: "📝" },
                    { text: "Write a Python sorting algorithm", icon: "💻" },
                    { text: "Analyze this code for bugs", icon: "🔍" }
                ].map((suggestion) => (
                    <button
                        key={suggestion.text}
                        onClick={() => { setInput(suggestion.text); textareaRef.current?.focus(); }}
                        className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-sm text-zinc-400 hover:text-zinc-200 group"
                    >
                        <span className="block text-lg mb-1">{suggestion.icon}</span>
                        <span className="text-xs">{suggestion.text}</span>
                    </button>
                ))}
                {currentMode === 'image' && [
                    { text: "A futuristic cyberpunk city in the rain", icon: "🌆" },
                    { text: "A cute cat wearing an astronaut suit", icon: "🐱" }
                ].map((suggestion) => (
                    <button
                        key={suggestion.text}
                        onClick={() => { setInput(suggestion.text); textareaRef.current?.focus(); }}
                        className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-sm text-zinc-400 hover:text-zinc-200 group"
                    >
                        <span className="block text-lg mb-1">{suggestion.icon}</span>
                        <span className="text-xs">{suggestion.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen pt-16 overflow-x-hidden relative bg-[#0a0a0a]">
            <Navbar />

            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 border-r border-white/[0.06] bg-[#0f0f0f] flex flex-col transition-all duration-300 overflow-hidden`}>
                    {/* New Chat Button */}
                    <div className="p-3">
                        <button
                            onClick={createNewChat}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-sm text-zinc-300 hover:text-white transition-all group"
                        >
                            <Plus className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                            <span>New chat</span>
                        </button>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
                        <div className="px-3 py-2">
                            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Recent</span>
                        </div>
                        {chatSessions.map(session => (
                            <div key={session.id} className="group relative">
                                <button
                                    onClick={() => switchChat(session.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-all ${activeChatId === session.id
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                                        <span className="truncate">{session.title}</span>
                                    </span>
                                </button>
                                {chatSessions.length > 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom */}
                    <div className="p-3 border-t border-white/[0.06]">
                        <div className="text-[9px] text-zinc-600 uppercase tracking-widest text-center">
                            Powered by OpenRouter
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Top Bar */}
                    <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 bg-[#0a0a0a]/80 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>

                            {/* Model Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-zinc-300 hover:text-white transition-all"
                                >
                                    {models.find(m => m.id === selectedModel)?.name || "Select Model"}
                                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                                </button>
                                {showModelDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowModelDropdown(false)} />
                                        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden">
                                            {models.map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-white/[0.06] transition-all flex items-center justify-between ${selectedModel === model.id ? 'bg-white/[0.04] text-white' : 'text-zinc-400'}`}
                                                >
                                                    <span className="text-sm">{model.name}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedModel === model.id ? 'border-primary/40 text-primary bg-primary/10' : 'border-white/10 text-zinc-500'}`}>
                                                        {model.badge}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    {messages.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div
                            ref={terminalRef}
                            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        >
                            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="group"
                                        >
                                            <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                {/* Avatar */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-primary/80' :
                                                    msg.role === 'ai' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' :
                                                        'bg-zinc-800 border border-zinc-700'
                                                    }`}>
                                                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> :
                                                        msg.role === 'ai' ? <Bot className="w-4 h-4 text-white" /> :
                                                            <Terminal className="w-3.5 h-3.5 text-zinc-400" />}
                                                </div>

                                                <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                                                    {/* Role label */}
                                                    <span className={`text-xs font-semibold mb-1 block ${msg.role === 'user' ? 'text-right text-zinc-400' :
                                                        msg.role === 'ai' ? 'text-zinc-400' : 'text-zinc-500'
                                                        }`}>
                                                        {msg.role === 'user' ? 'You' : msg.role === 'ai' ? 'AI' : 'System'}
                                                    </span>

                                                    {msg.role === 'user' ? (
                                                        <div className="flex flex-col items-end gap-2 max-w-[85%]">
                                                            {msg.imageUrl && (
                                                                <img src={msg.imageUrl} alt="Attached" className="rounded-xl shadow-md max-w-[200px] border border-white/10" />
                                                            )}
                                                            {msg.content && (
                                                                <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 text-[15px] text-zinc-200 whitespace-pre-wrap break-words inline-block">
                                                                    {msg.content}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : msg.role === 'system' ? (
                                                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 font-mono">
                                                            {msg.content}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[15px] text-zinc-300 leading-relaxed">
                                                            {msg.videoUrl && (
                                                                <div className="mb-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl max-w-md">
                                                                    <video src={msg.videoUrl} controls autoPlay loop className="w-full bg-black" />
                                                                </div>
                                                            )}
                                                            <div className="prose prose-invert max-w-none text-[15px] leading-7">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        code({ node, inline, className, children, ...props }: any) {
                                                                            const match = /language-(\w+)/.exec(className || "")
                                                                            if (!inline && match) {
                                                                                const codeStr = String(children).replace(/\n$/, "");
                                                                                return (
                                                                                    <div className="rounded-xl overflow-hidden my-4 border border-white/[0.06] text-[13px] shadow-lg">
                                                                                        <div className="bg-[#1a1a1a] px-4 py-2 text-xs text-zinc-500 font-mono flex items-center justify-between border-b border-white/[0.04]">
                                                                                            <span className="flex items-center gap-2">
                                                                                                <Terminal className="w-3 h-3" /> {match[1]}
                                                                                            </span>
                                                                                            <button
                                                                                                onClick={() => { navigator.clipboard.writeText(codeStr); }}
                                                                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-all"
                                                                                            >
                                                                                                <Copy className="w-3 h-3" />
                                                                                                <span>Copy</span>
                                                                                            </button>
                                                                                        </div>
                                                                                        <SyntaxHighlighter
                                                                                            style={vscDarkPlus as any}
                                                                                            language={match[1]}
                                                                                            PreTag="div"
                                                                                            customStyle={{ margin: 0, padding: "1rem", background: "#0d0d0d", overflowX: "auto" }}
                                                                                            {...props}
                                                                                        >
                                                                                            {codeStr}
                                                                                        </SyntaxHighlighter>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                            return (
                                                                                <code className="rounded px-1.5 py-0.5 text-[13px] font-mono bg-primary/15 text-primary border border-primary/20" {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            )
                                                                        },
                                                                        p: ({ children }) => <p className="mb-4 last:mb-0 text-zinc-300">{children}</p>,
                                                                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-zinc-300">{children}</ul>,
                                                                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-zinc-300">{children}</ol>,
                                                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                                                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                                        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-white border-b border-white/10 pb-2">{children}</h1>,
                                                                        h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2 text-white">{children}</h2>,
                                                                        h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-white">{children}</h3>,
                                                                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg text-zinc-400 my-4">{children}</blockquote>,
                                                                        img: ({ src, alt, ...props }) => (
                                                                            <span className="block my-4">
                                                                                <img src={src} alt={alt} className="rounded-xl shadow-lg max-w-full mx-auto" loading="lazy" {...props} />
                                                                                {alt && <span className="block text-center text-xs text-zinc-500 mt-2">{alt}</span>}
                                                                            </span>
                                                                        ),
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            </div>

                                                            {/* Message Actions */}
                                                            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleCopy(msg.content, idx)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-all text-xs"
                                                                    title="Copy"
                                                                >
                                                                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                                </button>
                                                                <button
                                                                    onClick={regenerateLastResponse}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-all text-xs"
                                                                    title="Regenerate"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownload(msg)}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-all text-xs"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Edit button for user messages */}
                                                    {msg.role === 'user' && (
                                                        <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => editMessage(idx)}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-all text-xs"
                                                            >
                                                                <PenLine className="w-3 h-3" /> Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Typing indicator */}
                                {isProcessing && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-white animate-pulse" />
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="px-4 pb-4 pt-2 z-10">
                        <div className="max-w-3xl mx-auto">
                            {/* Mode Selector Top Bar */}
                            <div className="flex items-center justify-center gap-2 mb-3">
                                {[
                                    { id: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
                                    { id: 'image', icon: <ImageIcon className="w-4 h-4" />, label: "Image Gen" },
                                    { id: 'video', icon: <PenLine className="w-4 h-4" />, label: "Video Gen" }
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => {
                                            setCurrentMode(mode.id as any);
                                            textareaRef.current?.focus();
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${currentMode === mode.id
                                            ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                                            : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:bg-white/[0.08] hover:text-zinc-200'
                                            }`}
                                    >
                                        {mode.icon} {mode.label}
                                    </button>
                                ))}
                            </div>

                            {/* Stop button */}
                            {isProcessing && (
                                <div className="flex justify-center mb-3">
                                    <button
                                        onClick={stopGenerating}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#1a1a1a] text-zinc-300 hover:bg-[#222] hover:text-white transition-all text-sm"
                                    >
                                        <Square className="w-3 h-3" /> Stop generating
                                    </button>
                                </div>
                            )}

                            <div className={`relative bg-[#1a1a1a] border border-white/[0.08] ${attachedFile ? 'rounded-2xl' : 'rounded-2xl'} hover:border-white/15 transition-all focus-within:border-white/20 shadow-lg`}>
                                {/* Attached file */}
                                {attachedFile && (
                                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                                        <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
                                            <Paperclip className="w-3 h-3 text-primary" />
                                            <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                                            <button onClick={() => setAttachedFile(null)} className="text-zinc-500 hover:text-white transition-colors ml-1">&times;</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-end px-2 py-2">
                                    {/* Attach */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*,.txt,.pdf,.py,.js,.ts,.json,.csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setAttachedFile(file);
                                            e.target.value = '';
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-all flex-shrink-0 mb-0.5"
                                        title="Attach file"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>

                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleRun();
                                            }
                                        }}
                                        placeholder="Message AI..."
                                        className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] placeholder:text-zinc-600 text-white min-h-[44px] max-h-[200px] py-3 px-2 w-full"
                                        rows={1}
                                        style={{ overflowY: "auto" }}
                                    />

                                    {/* Mic */}
                                    <button
                                        onClick={toggleVoiceInput}
                                        className={`p-2 rounded-lg transition-all flex-shrink-0 mb-0.5 ${isListening
                                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                                            : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                                            }`}
                                        title={isListening ? "Stop" : "Voice"}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>

                                    {/* Send */}
                                    <button
                                        id="send-btn"
                                        onClick={handleRun}
                                        disabled={isProcessing || (!input.trim() && !attachedFile)}
                                        className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:hover:bg-white transition-all flex-shrink-0 mb-0.5 ml-0.5"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-zinc-600 mt-3">
                                AI can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
