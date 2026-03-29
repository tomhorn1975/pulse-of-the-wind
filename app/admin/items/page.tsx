import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import DeleteItemButton from '@/components/DeleteItemButton'

export default async function AdminItemsPage() {
  const supabase = await createServiceClient()
  const { data: items } = await supabase
    .from('raffle_items')
    .select('*, ticket_purchases(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Raffle Items</h1>
        <Link href="/admin/items/new" className="bg-wind-600 hover:bg-wind-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">+ Add Item</Link>
      </div>
      {!items?.length ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-12 text-center text-slate-400">
          No items yet. <Link href="/admin/items/new" className="text-wind-600 hover:underline">Add the first one →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: { id: string; name: string; photo_url: string | null; estimated_value: number | null; raffle_date: string | null; is_active: boolean; ticket_purchases: { count: number }[] }) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-36 bg-slate-100">
                {item.photo_url
                  ? <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                  : <div className="h-full flex items-center justify-center text-3xl text-slate-300">🎁</div>}
                <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                {item.estimated_value && <p className="text-sm text-wind-600 mt-0.5">Value: ${Number(item.estimated_value).toLocaleString()}</p>}
                {item.raffle_date && <p className="text-xs text-slate-400 mt-1">Drawing: {new Date(item.raffle_date).toLocaleDateString()}</p>}
                <p className="text-xs text-slate-500 mt-1">{item.ticket_purchases?.[0]?.count ?? 0} tickets sold</p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/item/${item.id}`} className="text-xs text-wind-600 hover:underline">View →</Link>
                  <DeleteItemButton id={item.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
