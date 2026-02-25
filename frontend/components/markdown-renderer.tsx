"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect } from 'react'
import { Check, Copy, Terminal, ImageIcon, Zap } from 'lucide-react'

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
                            const isIntercepted = typeof src === 'string' && (src.includes('image.pollinations.ai/prompt/') || src.startsWith('unsplash:'));
                            const [imgSrc, setImgSrc] = useState(isIntercepted ? "" : src);
                            const [hasError, setHasError] = useState(false);
                            const [isLoading, setIsLoading] = useState(true);
                            const [retryCount, setRetryCount] = useState(0);

                            useEffect(() => {
                                // Only proceed if src is a string
                                if (typeof src !== 'string') {
                                    setHasError(true);
                                    setIsLoading(false);
                                    return;
                                }

                                // Handle special image generation/fetching cases
                                if (isIntercepted) {
                                    let query = "";
                                    if (src.includes('image.pollinations.ai/prompt/')) {
                                        const match = src.match(/\/prompt\/([^?]+)/);
                                        if (match) query = match[1];
                                    } else if (src.startsWith('unsplash:')) {
                                        query = src.replace('unsplash:', '');
                                    }

                                    if (query) {
                                        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
                                        fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${accessKey}`)
                                            .then(res => res.json())
                                            .then(data => {
                                                const url = data.urls?.regular || data[0]?.urls?.regular;
                                                if (url) {
                                                    setImgSrc(url);
                                                    setHasError(false);
                                                    setIsLoading(false); // Image URL found, stop loading
                                                } else { // No URL found from Unsplash
                                                    setHasError(true);
                                                    setIsLoading(false);
                                                }
                                            })
                                            .catch(err => {
                                                console.error("Unsplash replacement failed", err);
                                                setHasError(true);
                                                setIsLoading(false);
                                            });
                                    } else { // No query for Unsplash/Pollinations
                                        setHasError(true);
                                        setIsLoading(false);
                                    }
                                } else if (src.startsWith('http') || src.startsWith('/')) {
                                    // If it's a direct generic URL, set it and stop loading
                                    setImgSrc(src);
                                    setIsLoading(false);
                                    setHasError(false);
                                } else {
                                    // If we got here and it's not a URL or a special tag, it's likely a broken tag
                                    setHasError(true);
                                    setIsLoading(false);
                                }
                            }, [src, retryCount, isIntercepted]);

                            const handleRetry = () => {
                                setIsLoading(true);
                                setHasError(false);
                                if (isIntercepted) {
                                    setImgSrc("");
                                    setRetryCount(prev => prev + 1);
                                } else if (typeof src === 'string') {
                                    // Append a unique query parameter to force a re-fetch of basic URLs
                                    setImgSrc(src + (src.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime());
                                }
                            };

                            return (
                                <span className="block my-10 relative min-h-[300px] flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden w-full group">
                                    {isLoading && !hasError && (
                                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur z-10">
                                            <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(var(--primary),0.5)]"></span>
                                            <span className="text-sm font-medium tracking-wide text-foreground animate-pulse">Loading graphic...</span>
                                        </span>
                                    )}

                                    {!hasError && imgSrc && typeof imgSrc === 'string' && !imgSrc.startsWith('unsplash:') ? (
                                        <img
                                            src={imgSrc}
                                            alt={alt}
                                            className={`rounded-2xl max-w-full w-full object-cover transition-all duration-700 ease-in-out ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-[1.02]'}`}
                                            loading="lazy"
                                            onLoad={() => setIsLoading(false)}
                                            onError={() => {
                                                console.error("Failed to load image in markdown content:", imgSrc);
                                                setHasError(true);
                                                setIsLoading(false);
                                            }}
                                            {...props}
                                        />
                                    ) : hasError ? (
                                        <span className="flex flex-col items-center justify-center text-center p-12 gap-5 w-full bg-red-950/20 border border-red-500/20 rounded-2xl">
                                            <span className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                                                <ImageIcon className="w-10 h-10 text-red-400 opacity-80" />
                                            </span>
                                            <span className="block">
                                                <strong className="block text-red-400 font-bold text-lg mb-1">Image Blocked or Unavailable</strong>
                                                <span className="block text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">Could not automatically fetch: <span className="text-zinc-300 italic">&quot;{alt}&quot;</span>. The generative AI service might be rate-limiting requests.</span>
                                            </span>

                                            <button
                                                onClick={handleRetry}
                                                className="mt-4 px-6 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:border-primary hover:text-white hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all font-bold flex items-center gap-2"
                                            >
                                                <Zap className="w-4 h-4" /> Try Fetching Again
                                            </button>
                                        </span>
                                    ) : null}

                                    {!isLoading && !hasError && alt && (
                                        <span className="block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12 text-center text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 backdrop-blur-sm">
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
        </div>
    )
}
