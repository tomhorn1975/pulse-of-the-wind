import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { stripeLineItems, calculatePrice } from '@/lib/pricing'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { itemId, quantity, buyerName, buyerEmail } = await req.json()
    if (!itemId || !quantity || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: item, error } = await supabase
      .from('raffle_items')
      .select('id, name, raffle_date, is_active')
      .eq('id', itemId)
      .eq('is_active', true)
      .single()

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found or unavailable' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const lineItems = stripeLineItems(quantity).map(li => ({
      ...li,
      price_data: {
        ...li.price_data,
        product_data: {
          name: `${li.price_data.product_data.name} — ${item.name}`,
        },
      },
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: buyerEmail,
      success_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/item/${itemId}`,
      metadata: {
        itemId,
        quantity: String(quantity),
        buyerName,
        buyerEmail,
        amountPaid: String(calculatePrice(quantity) * 100),
        raffleDate: item.raffle_date || '',
        itemName: item.name,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
