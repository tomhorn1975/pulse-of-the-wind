import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createServiceClient()

  const [{ count: itemCount }, { count: ticketCount }, { data: recentSales }] = await Promise.all([
    supabase.from('raffle_items').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('ticket_purchases').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('ticket_purchases')
      .select('*, raffle_items(name)')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalRevenue = (recentSales || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Items',       value: itemCount ?? 0 },
          { label: 'Tickets Sold',       value: ticketCount ?? 0 },
          { label: 'Revenue Collected',  value: `$${(totalRevenue / 100).toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="text-3xl font-bold text-wind-700">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/admin/items/new"  className="bg-wind-600 hover:bg-wind-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">+ Add Raffle Item</Link>
        <Link href="/admin/print"      className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">🖨 Print Tickets</Link>
        <Link href="/admin/items"      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">Manage Items</Link>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-700">Recent Purchases</div>
        {!recentSales?.length ? (
          <div className="py-10 text-center text-slate-400 text-sm">No purchases yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {['Buyer', 'Item', 'Qty', 'Paid', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((p: { id: string; buyer_name: string; raffle_items: { name: string } | null; quantity: number; amount_paid: number; created_at: string }) => (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.buyer_name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.raffle_items?.name}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3 text-wind-700 font-semibold">${(p.amount_paid / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
