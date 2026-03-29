'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NewItemPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: '', description: '', estimated_value: '', raffle_date: '' })
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setPhotoUrl(data.url)
    else setError('Photo upload failed')
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    setSaving(true); setError('')
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim() || null,
        photo_url: photoUrl || null,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
        raffle_date: form.raffle_date || null,
        is_active: true,
      }),
    })
    const data = await res.json()
    if (data.id) router.push('/admin/items')
    else { setError(data.error || 'Failed to save item'); setSaving(false) }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add Raffle Item</h1>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-wind-400 transition-colors relative overflow-hidden"
            >
              {photoUrl ? (
                <Image src={photoUrl} alt="Preview" fill className="object-cover rounded-xl" />
              ) : uploading ? (
                <span className="text-slate-400 text-sm">Uploading…</span>
              ) : (
                <div className="text-center text-slate-400 text-sm">
                  <div className="text-3xl mb-1">📸</div>
                  Click to upload photo
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Item Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Yeti Cooler"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wind-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the item…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wind-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Value ($)</label>
              <input type="number" min="0" step="0.01" value={form.estimated_value}
                onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))}
                placeholder="0.00"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wind-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Drawing Date</label>
              <input type="date" value={form.raffle_date} onChange={e => setForm(f => ({ ...f, raffle_date: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wind-500" />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || uploading}
              className="flex-1 bg-wind-600 hover:bg-wind-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors">
              {saving ? 'Saving…' : 'Save Item'}
            </button>
            <button type="button" onClick={() => router.push('/admin/items')}
              className="px-4 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
