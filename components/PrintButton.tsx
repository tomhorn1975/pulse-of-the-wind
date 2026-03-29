'use client'
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors no-print"
    >
      🖨 Print All Tickets
    </button>
  )
}
