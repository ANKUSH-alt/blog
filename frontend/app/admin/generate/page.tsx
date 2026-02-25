"use client"

import AdminSidebar from "@/components/admin/sidebar"
import { motion } from "framer-motion"
import { Wand2, RefreshCw, Send, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { API_URL } from "@/lib/api"

export default function AIContentGenerator() {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [publishStatus, setPublishStatus] = useState("")
    const [isPublishing, setIsPublishing] = useState(false)

    const [topic, setTopic] = useState("")
    const [category, setCategory] = useState("Python Basics")
    const [difficulty, setDifficulty] = useState("Beginner")
    const [wordCount, setWordCount] = useState(800)
    const [includeCode, setIncludeCode] = useState(true)
    const [includeDiagrams, setIncludeDiagrams] = useState(false)
    const [generatedBlog, setGeneratedBlog] = useState<any>(null)

    const handleGenerate = async () => {
        if (!topic) return alert("Please enter a topic")
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/ai/generate-blog`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    word_count: wordCount,
                    include_code: includeCode,
                    include_diagrams: includeDiagrams
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to generate content")
            }

            const data = await response.json()
            setGeneratedBlog(data)
            setStep(2)
        } catch (error: any) {
            console.error("Content generation failed:", error)
            alert(error.message || "AI Generation failed. Check backend logs.")
        } finally {
            setLoading(false)
        }

    }

    const renderStepContent = () => {
        if (step === 1) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic / Keywords</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Backpropagation in Neural Networks"
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Article Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option>Python Basics</option>
                                <option>Machine Learning</option>
                                <option>Deep Learning</option>
                                <option>LLM Engineering</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Difficulty Level</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Word Count</label>
                            <input
                                type="number"
                                value={wordCount || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setWordCount(isNaN(val) ? 0 : val);
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Include Code</label>
                            <div className="flex items-center gap-4 py-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="code"
                                        checked={includeCode === true}
                                        onChange={() => setIncludeCode(true)}
                                    /> Yes
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="code"
                                        checked={includeCode === false}
                                        onChange={() => setIncludeCode(false)}
                                    /> No
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Include Diagrams</label>
                            <div className="flex items-center gap-4 py-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="diagrams"
                                        checked={includeDiagrams === true}
                                        onChange={() => setIncludeDiagrams(true)}
                                    /> Yes
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="diagrams"
                                        checked={includeDiagrams === false}
                                        onChange={() => setIncludeDiagrams(false)}
                                    /> No
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-8 py-3 rounded-lg ai-gradient text-white font-semibold flex items-center gap-2 ai-glow transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>Generating Content <RefreshCw className="w-4 h-4 animate-spin" /></>
                            ) : (
                                <>Start AI Generation <Wand2 className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            )
        }

        if (step === 2) {
            return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-primary" /> AI Result Preview
                    </h3>
                    {publishStatus && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${publishStatus.includes("Success") ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-red-500/10 border border-red-500/30 text-red-500"}`}>
                            {publishStatus}
                        </div>
                    )}
                    <div className="bg-secondary/50 p-6 rounded-lg border border-border flex flex-col gap-4 h-[600px]">
                        <input
                            type="text"
                            value={generatedBlog?.title || ""}
                            onChange={(e) => setGeneratedBlog({ ...generatedBlog, title: e.target.value })}
                            className="text-2xl font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none px-2 py-1 w-full transition-colors"
                            placeholder="Blog Title"
                        />
                        <textarea
                            value={generatedBlog?.content || ""}
                            onChange={(e) => setGeneratedBlog({ ...generatedBlog, content: e.target.value })}
                            className="flex-1 bg-transparent border border-border rounded p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none w-full transition-shadow"
                            placeholder="Blog Content (Markdown format)..."
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => { setStep(1); setPublishStatus(""); }}
                            className="px-6 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors font-medium border border-border"
                        >
                            Back to Edit
                        </button>
                        <button
                            disabled={isPublishing}
                            onClick={async () => {
                                try {
                                    setIsPublishing(true)
                                    setPublishStatus("")
                                    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                                    const response = await fetch(`${API_URL}/blogs/`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            title: generatedBlog.title,
                                            slug: slug,
                                            content: generatedBlog.content,
                                            category: category,
                                            tags: ["AI Generated"],
                                            seo_title: generatedBlog.seo_title || generatedBlog.title,
                                            seo_description: generatedBlog.seo_description || ""
                                        })
                                    })
                                    if (!response.ok) {
                                        const errData = await response.json()
                                        throw new Error(errData.detail || "Failed to publish")
                                    }
                                    // Add a small delay for dramatic effect
                                    await new Promise(resolve => setTimeout(resolve, 800))
                                    setPublishStatus("✅ Success! Blog published.")
                                    setStep(3)
                                } catch (err: any) {
                                    setPublishStatus(`❌ Error: ${err.message}`)
                                } finally {
                                    setIsPublishing(false)
                                }
                            }}
                            className={`px-8 py-3 rounded-lg text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(var(--primary),0.5)] ${isPublishing ? "bg-primary/50 cursor-not-allowed" : "ai-gradient ai-glow hover:scale-[1.05] active:scale-95"}`}
                        >
                            {isPublishing ? (
                                <>Publishing to Blog... <RefreshCw className="w-5 h-5 animate-spin" /></>
                            ) : (
                                <>Publish to Blog <Send className="w-5 h-5 hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6 text-center py-16">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="w-28 h-28 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-8 shield-glow"
                >
                    <CheckCircle2 className="w-14 h-14" />
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">
                        Successfully Published!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-lg mb-10">
                        Your AI-generated blog <span className="text-foreground font-semibold">&quot;{generatedBlog?.title}&quot;</span> is now live and can be viewed by your users.
                    </p>
                    <button
                        onClick={() => { setStep(1); setTopic(""); setPublishStatus(""); setGeneratedBlog(null); }}
                        className="px-8 py-3 rounded-xl ai-gradient text-white font-bold flex items-center gap-2 mx-auto ai-glow hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        <Wand2 className="w-5 h-5" /> Generate Another Blog
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">AI Content Assistant</h1>
                    <p className="text-muted-foreground">Generate high-quality, SEO-optimized educational content in seconds.</p>
                </header>

                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-4 mb-10 justify-center">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <motion.div
                                    animate={step >= s ? { scale: [1, 1.1, 1] } : {}}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm ${step >= s ? "bg-primary text-white shadow-primary/30" : "bg-secondary text-muted-foreground border border-border"
                                        }`}
                                >
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </motion.div>
                                <span className={`text-sm font-semibold transition-colors duration-300 ${step >= s ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                    {s === 1 ? "Configure" : s === 2 ? "Review & Edit" : "Published"}
                                </span>
                                {s < 3 && <div className={`w-16 h-1 rounded-full transition-colors duration-300 ${step > s ? "bg-primary/50" : "bg-secondary"}`} />}
                            </div>
                        ))}
                    </div>

                    <motion.div
                        key={step} // Force re-render on step change for animation
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card p-8 md:p-10 relative overflow-hidden"
                    >
                        {/* Subtle decorative background gradient */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

                        {renderStepContent()}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
