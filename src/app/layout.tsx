import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lumina | Explain-to-Win Game",
  description: "Teach the AI to win! A revolutionary new way to learn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
