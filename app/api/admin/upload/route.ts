import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase  = await createServiceClient()
  const formData  = await req.formData()
  const file      = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext      = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes    = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('raffle-photos')
    .upload(fileName, bytes, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: { publicUrl } } = supabase.storage
    .from('raffle-photos')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
