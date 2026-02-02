import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1a]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="Go to homepage">
            <Image src="/logo.png" alt="EcomChecklist Logo" width={28} height={28} className="rounded-md" />
            <span className="font-semibold text-slate-900 dark:text-white">ecomchecklist.net</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </a>
          </div>

          <div className="text-sm text-slate-500">© {new Date().getFullYear()} ecomchecklist.net — All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
