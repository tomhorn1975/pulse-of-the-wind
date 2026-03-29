import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createServiceClient()
  const body     = await req.json()
  const { data, error } = await supabase
    .from('raffle_items')
    .insert({ ...body })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const supabase = await createServiceClient()
  const { error } = await supabase.from('raffle_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
