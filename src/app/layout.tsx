import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Ecom Checklist - Free E-commerce Store Audit",
  description: "Get a comprehensive audit of your e-commerce store. Find hidden issues hurting your sales and get actionable fixes in minutes.",
  keywords: ["e-commerce", "store audit", "conversion optimization", "SEO", "checklist"],
  openGraph: {
    title: "Ecom Checklist - Free E-commerce Store Audit",
    description: "Find hidden issues hurting your sales. Get actionable fixes in minutes.",
    url: "https://ecomchecklist.net",
    siteName: "Ecom Checklist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecom Checklist - Free E-commerce Store Audit",
    description: "Find hidden issues hurting your sales. Get actionable fixes in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
