import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InitialProductLoader } from "@/components/layout/InitialProductLoader";

export const viewport: Viewport = {
  themeColor: "#0755B5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ChoreCraft — Gamified AI Productivity Platform",
  description: "Execute real-world digital chores in the background while unlocking interactive puzzle experiences.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-parchment text-slate-text selection:bg-cobalt selection:text-white">
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-cobalt focus:text-white focus:font-bold focus:rounded-lg focus:shadow-floating focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cobalt"
        >
          Skip to main content
        </a>
        <InitialProductLoader />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

