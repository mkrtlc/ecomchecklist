import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type BlogFrontmatter = {
  title: string;
  excerpt: string;
  date: string; // ISO date string
  updated?: string; // ISO date string
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  readingTimeMinutes: number;
};

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function assertBlogDir() {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    throw new Error(
      `Missing blog content directory at ${BLOG_CONTENT_DIR}. Create content/blog/*.mdx files.`
    );
  }
}

export function getBlogSlugs(): string[] {
  assertBlogDir();
  const entries = fs.readdirSync(BLOG_CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && (e.name.endsWith(".mdx") || e.name.endsWith(".md")))
    .map((e) => e.name.replace(/\.(mdx|md)$/, ""));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  assertBlogDir();

  const mdxPath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_CONTENT_DIR, `${slug}.md`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const frontmatter = data as BlogFrontmatter;
  if (!frontmatter?.title || !frontmatter?.excerpt || !frontmatter?.date) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}. Required: title, excerpt, date.`
    );
  }

  const rt = readingTime(content);
  const minutes = Math.max(1, Math.round(rt.minutes));

  return {
    slug,
    frontmatter,
    content,
    readingTimeMinutes: minutes,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const slugs = getBlogSlugs();
  const posts = slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((p): p is BlogPost => Boolean(p));

  posts.sort((a, b) => {
    const ad = new Date(a.frontmatter.date).getTime();
    const bd = new Date(b.frontmatter.date).getTime();
    return bd - ad;
  });

  return posts;
}
