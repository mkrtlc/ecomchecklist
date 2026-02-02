import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Ecom Checklist",
  description:
    "Practical e-commerce audits, CRO, UX, performance, and measurement guides for 2026 and beyond.",
  alternates: { canonical: "https://ecomchecklist.net/blog" },
  openGraph: {
    title: "Blog | Ecom Checklist",
    description:
      "Practical e-commerce audits, CRO, UX, performance, and measurement guides for 2026 and beyond.",
    url: "https://ecomchecklist.net/blog",
    siteName: "Ecom Checklist",
    type: "website",
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Ecom Checklist Blog
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
          Pillar guides and tactical checklists on audits, CRO, UX, performance,
          analytics, checkout, and retention.
        </p>
      </header>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-6"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
              <span aria-hidden>•</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>

            <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
                {post.frontmatter.title}
              </Link>
            </h2>

            <p className="mt-3 text-slate-700 dark:text-slate-200 leading-7">
              {post.frontmatter.excerpt}
            </p>

            <div className="mt-4">
              <Link
                href={`/blog/${post.slug}`}
                className="text-primary font-medium hover:opacity-90"
              >
                Read →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
