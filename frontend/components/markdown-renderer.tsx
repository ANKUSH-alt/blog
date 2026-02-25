"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'

interface MarkdownRendererProps {
    content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-invert max-w-none w-full">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => <h1 className="text-4xl md:text-5xl font-extrabold mt-12 mb-6 text-foreground tracking-tight border-b border-border/50 pb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-3xl font-bold mt-10 mb-5 text-foreground/90 flex items-center gap-2 before:content-[''] before:w-2 before:h-8 before:bg-primary before:block before:rounded-full">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-bold mt-8 mb-4 text-foreground/80">{children}</h3>,
                    p: ({ children }) => <p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl font-light">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-3 text-lg text-muted-foreground marker:text-primary">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-lg text-muted-foreground marker:text-primary font-medium">{children}</ol>,
                    li: ({ children }) => <li className="pl-2 leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-foreground tracking-wide bg-primary/10 px-1 rounded">{children}</strong>,
                    a: ({ href, children }) => <a href={href} className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 font-medium" target="_blank" rel="noopener noreferrer">{children}</a>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-2xl italic text-muted-foreground my-8 shadow-inner relative overflow-hidden glass-card">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                            <div className="relative z-10 text-lg">{children}</div>
                        </blockquote>
                    ),
                    code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "")
                        const codeString = String(children).replace(/\n$/, "")

                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const [isCopied, setIsCopied] = useState(false)

                        const handleCopy = () => {
                            navigator.clipboard.writeText(codeString)
                            setIsCopied(true)
                            setTimeout(() => setIsCopied(false), 2000)
                        }

                        return !inline && match ? (
                            <div className="rounded-xl overflow-hidden my-8 border border-white/10 shadow-2xl bg-[#1e1e1e]">
                                <div className="bg-zinc-900/80 backdrop-blur px-4 py-3 text-xs text-zinc-400 font-mono flex items-center justify-between border-b border-white/5">
                                    <span className="flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-primary" />
                                        {match[1]}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="hover:bg-white/10 p-1.5 rounded-md transition-colors flex items-center gap-1 text-zinc-300 hover:text-white"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span className="text-[10px] font-bold tracking-wider uppercase">{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                                <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: "1.5rem", background: "transparent", fontSize: "14px", overflowX: "auto" }}
                                    {...props}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className="rounded px-1.5 py-0.5 text-[14px] font-mono bg-secondary/50 text-primary border border-border" {...props}>
                                {children}
                            </code>
                        )
                    },
                    img: ({ src, alt, ...props }) => {
                        const FallbackImage = () => {
                            // Since AI image generation is disabled, we drop any legacy generated tags to prevent broken UI
                            const isIntercepted = typeof src === 'string' && (src.includes('image.pollinations.ai/prompt/') || src.startsWith('unsplash:'));

                            if (isIntercepted) {
                                return null;
                            }

                            return (
                                <span className="block my-8 flex items-center justify-center w-full group relative">
                                    <img
                                        src={typeof src === 'string' ? src : ""}
                                        alt={alt || "Blog image"}
                                        className="rounded-2xl max-w-full w-full object-cover border border-white/5 shadow-lg"
                                        loading="lazy"
                                        {...props}
                                    />
                                    {alt && (
                                        <span className="max-md:hidden block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12 text-center text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 backdrop-blur-sm rounded-b-2xl">
                                            {alt}
                                        </span>
                                    )}
                                </span>
                            );
                        };
                        return <FallbackImage />;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div >
    )
}
