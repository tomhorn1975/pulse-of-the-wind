'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculatePrice, pricingLabel } from '@/lib/pricing'
import type { RaffleItem } from '@/lib/types'

const PRESETS = [1, 6, 12, 25]

export default function ItemPage() {
  const { id } = useParams<{ id: string }>()
  const router   = useRouter()
  const [item, setItem]           = useState<RaffleItem | null>(null)
  const [qty, setQty]             = useState(1)
  const [custom, setCustom]       = useState('')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.from('raffle_items').select('*').eq('id', id).eq('is_active', true).single()
      .then(({ data }) => { setItem(data); setLoading(false) })
  }, [id])

  const quantity = custom ? Math.max(1, parseInt(custom) || 1) : qty
  const price    = calculatePrice(quantity)

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return setError('Please enter your name and email.')
    setError(''); setSubmitting(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id, quantity, buyerName: name.trim(), buyerEmail: email.trim() }),
    })
    const data = await res.json()
    if (data.url) { window.location.href = data.url }
    else { setError(data.error || 'Something went wrong. Please try again.'); setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-wind-600 text-4xl animate-spin">⚙</div>
    </div>
  )
  if (!item) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 text-lg">Item not found.</p>
      <button onClick={() => router.push('/')} className="text-wind-600 hover:underline">← Back to all items</button>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-wind-700 to-sky-500 text-white py-4 px-6 no-print">
        <button onClick={() => router.push('/')} className="text-wind-200 hover:text-white text-sm">
          ← Back to all items
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {item.photo_url && (
            <div className="relative h-72 w-full bg-slate-100">
              <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
            {item.estimated_value && (
              <p className="text-wind-600 font-semibold mt-1">Estimated value: ${Number(item.estimated_value).toLocaleString()}</p>
            )}
            {item.description && <p className="text-slate-600 mt-3 leading-relaxed">{item.description}</p>}
            {item.raffle_date && (
              <p className="text-sm text-slate-400 mt-2">
                🗓 Drawing: {new Date(item.raffle_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}

            <hr className="my-6 border-slate-100" />

            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Ticket quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">How many tickets?</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESETS.map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => { setQty(p); setCustom('') }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${qty === p && !custom
                        ? 'bg-wind-600 text-white border-wind-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-wind-400'}`}
                    >
                      {p} {p === 1 ? 'ticket' : 'tickets'}{p === 6 ? ' 🔥' : ''}
                    </button>
                  ))}
                  <input
                    type="number" min="1" max="500" placeholder="Custom"
                    value={custom}
                    onChange={e => { setCustom(e.target.value); setQty(0) }}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wind-500"
                  />
                </div>
                <div className="bg-wind-50 border border-wind-200 rounded-lg px-4 py-3 text-sm">
                  <span className="text-wind-800 font-semibold">{quantity} ticket{quantity !== 1 ? 's' : ''}</span>
                  <span className="text-wind-600"> · </span>
                  <span className="text-wind-800 font-semibold">{pricingLabel(quantity)}</span>
                  <div className="text-wind-500 text-xs mt-1">$1 each · 6 for $5</div>
                </div>
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wind-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wind-500"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 -mt-3">Your ticket numbers will be emailed to you after payment.</p>

              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

              <button
                type="submit" disabled={submitting}
                className="w-full bg-wind-600 hover:bg-wind-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-base transition-colors"
              >
                {submitting ? 'Redirecting to payment…' : `Pay $${price}.00 · Get ${quantity} Ticket${quantity !== 1 ? 's' : ''}`}
              </button>
              <p className="text-center text-xs text-slate-400">Secure payment powered by Stripe 🔒</p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
