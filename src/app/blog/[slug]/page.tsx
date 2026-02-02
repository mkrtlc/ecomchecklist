import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Footer } from "@/components/Footer";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  const url = `https://ecomchecklist.net/blog/${post.slug}`;
  const title = post.frontmatter.metaTitle ?? post.frontmatter.title;
  const description = post.frontmatter.metaDescription ?? post.frontmatter.excerpt;

  return {
    title: `${title} | Ecom Checklist`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Ecom Checklist",
      type: "article",
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updated ?? post.frontmatter.date,
      images: post.frontmatter.ogImage ? [post.frontmatter.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.frontmatter.ogImage ? [post.frontmatter.ogImage] : undefined,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-slate-600 dark:text-slate-300 hover:underline underline-offset-4">
          ← Back to Blog
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {post.frontmatter.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
          <span aria-hidden>•</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
        <p className="mt-5 text-slate-700 dark:text-slate-200 leading-7">
          {post.frontmatter.excerpt}
        </p>
      </header>

      <article>
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
            },
          }}
        />
      </article>

      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8">
        <Link href="/blog" className="text-primary font-medium hover:opacity-90">
          Browse more articles →
        </Link>
      </footer>
    </main>
      <Footer />
    </>
  );
}
