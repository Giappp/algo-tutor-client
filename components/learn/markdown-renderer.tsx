import type { ReactNode } from "react";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { cn } from "@/lib/utils";

type MarkdownVariant = "theory" | "problem";

interface MarkdownRendererProps {
    content: string;
    variant?: MarkdownVariant;
    getHeadingId?: (children: ReactNode, level: 2 | 3) => string;
}

function textSize(variant: MarkdownVariant) {
    return variant === "theory"
        ? {
            paragraph: "text-[1.03rem] leading-8",
            h1: "text-3xl",
            h2: "mt-10 text-2xl",
            h3: "mt-7 text-xl",
            list: "text-[1.03rem] leading-8",
            code: "text-[0.875rem]",
        }
        : {
            paragraph: "text-sm leading-7 sm:text-base",
            h1: "text-2xl",
            h2: "mt-8 text-xl",
            h3: "mt-6 text-lg",
            list: "text-sm leading-7 sm:text-base",
            code: "text-[0.85rem]",
        };
}

export function MarkdownRenderer({
    content,
    variant = "theory",
    getHeadingId,
}: MarkdownRendererProps) {
    const sizes = textSize(variant);

    const components: Components = {
        h1: ({ children }) => (
            <h1
                className={cn(
                    "mb-4 scroll-mt-6 font-heading font-bold leading-tight tracking-tight text-foreground",
                    sizes.h1
                )}
            >
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2
                id={getHeadingId?.(children, 2)}
                className={cn(
                    "mb-4 scroll-mt-6 border-b border-border/50 pb-2 font-heading font-bold leading-tight tracking-tight text-foreground",
                    sizes.h2
                )}
            >
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3
                id={getHeadingId?.(children, 3)}
                className={cn(
                    "mb-3 scroll-mt-6 font-heading font-bold leading-tight tracking-tight text-foreground",
                    sizes.h3
                )}
            >
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className="mb-2 mt-5 font-heading text-base font-bold leading-tight text-foreground">
                {children}
            </h4>
        ),
        p: ({ children }) => (
            <p className={cn("my-4 text-foreground/90", sizes.paragraph)}>
                {children}
            </p>
        ),
        a: ({ children, href }) => (
            <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noreferrer" : undefined}
                className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
                {children}
            </a>
        ),
        strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
            <em className="text-foreground/90">{children}</em>
        ),
        ul: ({ children }) => (
            <ul className={cn("my-4 flex list-disc flex-col gap-2 pl-6 text-foreground/90 marker:text-[var(--lesson-accent)]", sizes.list)}>
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className={cn("my-4 flex list-decimal flex-col gap-2 pl-6 text-foreground/90 marker:font-bold marker:text-[var(--lesson-accent)]", sizes.list)}>
                {children}
            </ol>
        ),
        li: ({ children }) => (
            <li className="pl-1">{children}</li>
        ),
        blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-xl border-l-4 border-[var(--lesson-accent)] bg-[var(--lesson-accent-muted)] px-5 py-3 text-foreground/85">
                {children}
            </blockquote>
        ),
        code: ({ children, className }) => {
            const value = String(children).replace(/\n$/, "");
            const isBlock = Boolean(className) || value.includes("\n");

            if (isBlock) {
                return (
                    <code className={cn("block whitespace-pre font-mono leading-relaxed text-zinc-100", sizes.code, className)}>
                        {value}
                    </code>
                );
            }

            return (
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.875em] font-semibold text-primary">
                    {children}
                </code>
            );
        },
        pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-xl border border-zinc-800 bg-[#18181b] p-4 shadow-sm">
                {children}
            </pre>
        ),
        table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border bg-card/70">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }) => (
            <th className="border-b border-r border-border bg-muted/60 px-4 py-2 text-left font-semibold text-foreground last:border-r-0">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="border-b border-r border-border px-4 py-2 align-top text-foreground/90 last:border-r-0">
                {children}
            </td>
        ),
        hr: () => <hr className="my-8 border-border/70" />,
        img: ({ alt, src }) => {
            if (!src) return null;

            return (
                <Image
                    alt={alt ?? ""}
                    src={String(src)}
                    width={1200}
                    height={675}
                    unoptimized
                    className="my-6 h-auto max-h-[520px] w-full rounded-xl border border-border/60 object-contain shadow-sm"
                />
            );
        },
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
}
