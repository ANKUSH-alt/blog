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
                            const MAX_RETRIES = 2;
                            const FETCH_TIMEOUT_MS = 5000;

                            const fetchImageWithTimeout = async (url: string, options: RequestInit = {}) => {
                                const controller = new AbortController();
                                const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
                                try {
                                    const response = await fetch(url, {
                                        ...options,
                                        signal: controller.signal
                                    });
                                    clearTimeout(id);
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    return response;
                                } catch (error) {
                                    clearTimeout(id);
                                    throw error;
                                }
                            };

                            useEffect(() => {
                                let isMounted = true;

                                const loadImage = async () => {
                                    if (!isMounted) return;

                                    setIsLoading(true);
                                    setHasError(false);

                                    // Only proceed if src is a string
                                    if (typeof src !== 'string') {
                                        console.error("[MarkdownRenderer] Image src is not a valid string.", { src });
                                        if (isMounted) {
                                            setHasError(true);
                                            setIsLoading(false);
                                        }
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
                                            try {
                                                const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
                                                const url = `https://api.unsplash.com/photos/random?query=${query}&client_id=${accessKey}`;
                                                const res = await fetchImageWithTimeout(url);
                                                const data = await res.json();

                                                const imageUrl = data.urls?.regular || data[0]?.urls?.regular;

                                                if (isMounted) {
                                                    if (imageUrl) {
                                                        setImgSrc(imageUrl);
                                                        setHasError(false);
                                                        // Note: We don't set isLoading(false) here because the actual <img> tag still needs to load the URL
                                                    } else {
                                                        console.error("[MarkdownRenderer] No URL found from Unsplash response.", { data });
                                                        setHasError(true);
                                                        setIsLoading(false);
                                                    }
                                                }
                                            } catch (err: any) {
                                                if (isMounted) {
                                                    console.error(`[MarkdownRenderer] Fetch failed for query "${query}":`, err.message || err);
                                                    setHasError(true);
                                                    setIsLoading(false);
                                                }
                                            }
                                        } else {
                                            // No query for Unsplash/Pollinations
                                            console.error("[MarkdownRenderer] Intercepted image URL had no recognizable query.", { src });
                                            if (isMounted) {
                                                setHasError(true);
                                                setIsLoading(false);
                                            }
                                        }
                                    } else if (src.startsWith('http') || src.startsWith('/')) {
                                        // If it's a direct generic URL, set it and let the <img> tag load it
                                        if (isMounted) {
                                            setImgSrc(src);
                                            setIsLoading(true); // Let the onLoad handler of <img> clear this
                                            setHasError(false);
                                        }
                                    } else {
                                        // If we got here and it's not a URL or a special tag, it's likely a broken tag
                                        console.error("[MarkdownRenderer] Image tag has unrecognized src format.", { src });
                                        if (isMounted) {
                                            setHasError(true);
                                            setIsLoading(false);
                                        }
                                    }
                                };

                                loadImage();

                                return () => {
                                    isMounted = false;
                                };
                            }, [src, retryCount, isIntercepted]);

                            const handleRetry = () => {
                                if (retryCount >= MAX_RETRIES) return;

                                console.log(`[MarkdownRenderer] Retrying image fetch (${retryCount + 1}/${MAX_RETRIES})...`);
                                setIsLoading(true);
                                setHasError(false);

                                if (isIntercepted) {
                                    setImgSrc("");
                                    setRetryCount(prev => prev + 1);
                                } else if (typeof src === 'string') {
                                    // Append a unique query parameter to force a re-fetch of basic URLs
                                    setImgSrc(src + (src.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime());
                                    setRetryCount(prev => prev + 1);
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
                                            alt={alt || "Content visualization"}
                                            className={`rounded-2xl max-w-full w-full object-cover transition-all duration-700 ease-in-out ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-[1.02]'}`}
                                            loading="lazy"
                                            onLoad={() => setIsLoading(false)}
                                            onError={() => {
                                                console.error(`[MarkdownRenderer] Failed to load actual image element from src: ${imgSrc}`);
                                                setHasError(true);
                                                setIsLoading(false);
                                            }}
                                            {...props}
                                        />
                                    ) : hasError ? (
                                        <span className="flex flex-col items-center justify-center w-full relative group/fallback">
                                            <img
                                                src="/assets/fallback-image.svg"
                                                alt="Fallback placeholder"
                                                className="rounded-2xl max-w-full w-full object-cover opacity-80 grayscale-[20%]"
                                                loading="lazy"
                                            />
                                            <span className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover/fallback:opacity-100 transition-opacity duration-300">
                                                <span className="block max-w-md">
                                                    <strong className="block text-white font-semibold text-lg mb-2">Image visualization unavailable</strong>
                                                    <span className="block text-sm text-zinc-300 leading-relaxed drop-shadow-md">
                                                        We couldn't generate or load this visualization right now.
                                                        {alt && <span className="block mt-1 italic opacity-80">&quot;{alt}&quot;</span>}
                                                    </span>
                                                </span>

                                                {retryCount < MAX_RETRIES ? (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleRetry(); }}
                                                        className="mt-4 px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black hover:shadow-lg transition-all font-semibold flex items-center gap-2 text-sm backdrop-blur-md"
                                                    >
                                                        <Zap className="w-4 h-4" /> Try Again {retryCount > 0 && `(${retryCount}/${MAX_RETRIES})`}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs object-bottom text-white/70 mt-4 px-3 py-1 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                                                        Maximum retry attempts reached
                                                    </span>
                                                )}
                                            </span>
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
        </div >
    )
}
