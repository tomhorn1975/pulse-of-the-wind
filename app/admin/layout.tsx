import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-wind-700 text-white px-6 py-3 flex items-center justify-between shadow no-print">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌬️</span>
          <span className="font-bold">Admin — Pulse of the Wind</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin"         className="text-wind-200 hover:text-white">Dashboard</Link>
          <Link href="/admin/items"   className="text-wind-200 hover:text-white">Items</Link>
          <Link href="/admin/items/new" className="text-wind-200 hover:text-white">+ Add Item</Link>
          <Link href="/admin/print"   className="text-wind-200 hover:text-white">Print Tickets</Link>
          <Link href="/"              className="text-wind-200 hover:text-white">View Site</Link>
          <form action="/admin/logout" method="POST">
            <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs">Log Out</button>
          </form>
        </nav>
      </header>
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </div>
    </div>
  )
}
