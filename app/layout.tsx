import type { Metadata } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PromptWars — Gamified AI Productivity Platform",
  description: "Execute real-world digital chores in the background while unlocking interactive puzzle experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-parchment text-slate-text selection:bg-cobalt selection:text-white">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

