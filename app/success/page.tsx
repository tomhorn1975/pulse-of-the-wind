import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎟️</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">You&apos;re in!</h1>
        <p className="text-slate-600 mb-2">
          Your tickets have been purchased and entered into the drawing.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Check your email — we've sent your ticket numbers. Keep them for reference, though you don&apos;t need to be present to win!
        </p>
        <div className="bg-wind-50 border border-wind-200 rounded-xl p-4 text-sm text-wind-800 mb-8">
          🌬️ <strong>On the drawing day</strong>, all online tickets are printed and added to the bucket alongside event-day tickets. Good luck!
        </div>
        <Link href="/" className="inline-block bg-wind-600 hover:bg-wind-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          ← Back to All Items
        </Link>
      </div>
    </main>
  )
}
