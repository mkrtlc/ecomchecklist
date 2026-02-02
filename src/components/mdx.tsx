import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mt-8 mb-4" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mt-10 mb-3" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-2" {...props} />
  ),
  p: (props) => (
    <p className="text-base leading-7 text-slate-700 dark:text-slate-200 my-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-200" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-200" {...props} />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  a: (props) => {
    const href = typeof props.href === "string" ? props.href : "";
    const isInternal = href.startsWith("/");
    const className =
      "text-primary underline underline-offset-4 hover:opacity-90" +
      (props.className ? ` ${props.className}` : "");

    if (isInternal) {
      const { href: _href, ...rest } = props as unknown as { href?: unknown } & Record<string, unknown>;
      return <Link href={href} className={className} {...rest} />;
    }

    return (
      <a
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 my-6 text-slate-700 dark:text-slate-200 italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[0.95em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="overflow-x-auto rounded-lg bg-slate-950 text-slate-50 p-4 my-6 text-sm leading-6"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-10 border-slate-200 dark:border-slate-800" {...props} />,
};
