'use client'
import { useRouter } from 'next/navigation'

export default function DeleteItemButton({ id }: { id: string }) {
  const router = useRouter()
  async function handleDelete() {
    if (!confirm('Delete this item and all its ticket data? This cannot be undone.')) return
    await fetch('/api/admin/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }
  return (
    <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 hover:underline">
      Delete
    </button>
  )
}
