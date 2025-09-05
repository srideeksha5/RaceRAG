import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaceRAG 🏎️",
  description: "RaceRAG - Retrieval-Augmented AI assistant for Formula 1 race insights, stats, and Q&A",
  keywords: ["Formula 1", "AI", "RAG", "RaceRAG", "Motorsport", "Chatbot"],
  authors: [{ name: "Sri Deekshaa" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
