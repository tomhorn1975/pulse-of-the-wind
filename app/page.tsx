import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { RaffleItem } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('raffle_items')
    .select('*, ticket_purchases(count)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const raffleDate = items?.[0]?.raffle_date
    ? new Date(items[0].raffle_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-br from-wind-700 via-wind-600 to-sky-500 text-white py-16 px-6 text-center">
        <div className="text-5xl mb-4">🌬️</div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Pulse of the Wind</h1>
        <p className="text-wind-100 text-lg max-w-xl mx-auto mb-4">
          Support our charity by entering our raffle. Every ticket counts — and could win you something amazing!
        </p>
        {raffleDate && (
          <div className="inline-block bg-white/20 backdrop-blur rounded-full px-5 py-2 text-sm font-medium">
            🗓 Drawing: {raffleDate}
          </div>
        )}
      </header>

      {/* Pricing banner */}
      <div className="bg-wind-600 text-white text-center py-3 px-4 text-sm font-medium no-print">
        🎟️ &nbsp;<strong>$1.00 each</strong> &nbsp;·&nbsp; <strong>6 for $5.00</strong> &nbsp;— Tickets entered per item
      </div>

      {/* Items grid */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {!items?.length ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-lg">Raffle items coming soon — check back shortly!</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-700 mb-6">
              {items.length} item{items.length !== 1 ? 's' : ''} up for grabs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: RaffleItem & { ticket_purchases: { count: number }[] }) => {
                const sold = item.ticket_purchases?.[0]?.count ?? 0
                return (
                  <Link
                    key={item.id}
                    href={`/item/${item.id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="relative h-52 bg-slate-100">
                      {item.photo_url ? (
                        <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-4xl text-slate-300">🎁</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-wind-700 transition-colors">{item.name}</h3>
                      {item.estimated_value && (
                        <p className="text-wind-600 font-semibold text-sm mt-1">
                          Estimated value: ${Number(item.estimated_value).toLocaleString()}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-slate-400">{sold} ticket{sold !== 1 ? 's' : ''} sold</span>
                        <span className="bg-wind-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full group-hover:bg-wind-700 transition-colors">
                          Enter to Win →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>

      <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-100 no-print">
        © {new Date().getFullYear()} TJ&apos;s Race · <a href="mailto:info@tjsrace.com" className="hover:text-wind-600">Contact Us</a>
      </footer>
    </main>
  )
}
