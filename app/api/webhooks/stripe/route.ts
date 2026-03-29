import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendTicketConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as { metadata: Record<string, string>; id: string; payment_status: string }
    const meta     = session.metadata || {}
    const { itemId, quantity, buyerName, buyerEmail, raffleDate, itemName } = meta
    const qty      = parseInt(quantity)

    if (!itemId || !qty || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Allocate ticket numbers atomically
    const { data: ticketNumbers, error: allocErr } = await supabase
      .rpc('allocate_tickets', { p_item_id: itemId, p_quantity: qty })

    if (allocErr || !ticketNumbers) {
      console.error('Ticket allocation error:', allocErr)
      return NextResponse.json({ error: 'Failed to allocate tickets' }, { status: 500 })
    }

    // Save purchase record
    const { error: insertErr } = await supabase.from('ticket_purchases').insert({
      item_id: itemId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      quantity: qty,
      ticket_numbers: ticketNumbers,
      stripe_session_id: session.id,
      amount_paid: parseInt(meta.amountPaid || '0'),
      status: 'confirmed',
    })

    if (insertErr) {
      console.error('Insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to save purchase' }, { status: 500 })
    }

    // Send confirmation email
    try {
      await sendTicketConfirmation({
        to: buyerEmail,
        buyerName,
        itemName: itemName || 'Raffle Item',
        ticketNumbers,
        raffleDate: raffleDate
          ? new Date(raffleDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          : 'TBD',
      })
    } catch (emailErr) {
      // Non-fatal: log but don't fail the webhook
      console.error('Email error:', emailErr)
    }
  }

  return NextResponse.json({ received: true })
}
