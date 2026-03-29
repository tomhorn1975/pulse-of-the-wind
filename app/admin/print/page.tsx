import { createServiceClient } from '@/lib/supabase/server'
import PrintButton from '@/components/PrintButton'

export default async function PrintTicketsPage() {
  const supabase = await createServiceClient()

  const { data: purchases } = await supabase
    .from('ticket_purchases')
    .select('*, raffle_items(name, raffle_date)')
    .eq('status', 'confirmed')
    .order('item_id')
    .order('created_at')

  // Group by item
  const byItem: Record<string, { itemName: string; raffleDate: string | null; tickets: { num: string; buyer: string }[] }> = {}
  for (const p of (purchases || [])) {
    const key = p.item_id
    if (!byItem[key]) {
      byItem[key] = {
        itemName: p.raffle_items?.name || 'Unknown Item',
        raffleDate: p.raffle_items?.raffle_date || null,
        tickets: [],
      }
    }
    for (const num of (p.ticket_numbers as string[])) {
      byItem[key].tickets.push({ num, buyer: p.buyer_name })
    }
  }

  const totalTickets = Object.values(byItem).reduce((s, g) => s + g.tickets.length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Print Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">{totalTickets} total tickets across {Object.keys(byItem).length} items</p>
        </div>
        <PrintButton />
      </div>

      {!totalTickets ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-12 text-center text-slate-400 no-print">
          No confirmed tickets yet.
        </div>
      ) : (
        Object.values(byItem).map((group) => (
          <div key={group.itemName} className="mb-10">
            {/* Section header */}
            <div className="bg-wind-700 text-white px-4 py-3 rounded-t-xl font-bold text-base no-print">
              {group.itemName} — {group.tickets.length} tickets
              {group.raffleDate && ` · Drawing: ${new Date(group.raffleDate).toLocaleDateString()}`}
            </div>
            <div className="print-section-header" style={{ display: 'none' }}>
              <strong>{group.itemName}</strong>
            </div>

            {/* Ticket grid */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-b-xl border border-t-0 border-slate-200 print:bg-white print:border-none print:p-0 print:gap-3">
              {group.tickets.map((t) => (
                <div
                  key={t.num}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-2.5 text-center bg-white print:border-black print:break-inside-avoid"
                  style={{ minHeight: '90px' }}
                >
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">🌬️ Pulse of the Wind</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 truncate">{group.itemName}</div>
                  <div className="font-mono font-bold text-wind-700 text-sm mt-1">{t.num}</div>
                  <div className="text-[10px] text-slate-600 mt-1 font-medium truncate">{t.buyer}</div>
                  {group.raffleDate && (
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(group.raffleDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
