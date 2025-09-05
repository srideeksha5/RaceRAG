export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-red-600 via-gray-900 to-black text-white">
      <div className="text-center p-8 rounded-2xl shadow-lg bg-black/40">
        <h1 className="text-5xl font-extrabold mb-4">
          🏎️ Welcome to <span className="text-red-400">RaceRAG</span>
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Your Retrieval-Augmented AI assistant for Formula 1 race stats, driver insights, and Q&A.
        </p>
        <button className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-lg font-semibold shadow-md transition-all">
          Start Chatting
        </button>
      </div>
    </main>
  );
}
