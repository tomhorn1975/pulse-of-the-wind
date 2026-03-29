// $1 each or 6 for $5
export function calculatePrice(qty: number): number {
  const bundles = Math.floor(qty / 6)
  const singles = qty % 6
  return bundles * 5 + singles * 1
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function pricingLabel(qty: number): string {
  const total = calculatePrice(qty)
  const savings = qty - total
  return savings > 0
    ? `$${total}.00 (saving $${savings}.00)`
    : `$${total}.00`
}

// Build Stripe line items — uses bundle + single items so receipt is clear
export function stripeLineItems(qty: number) {
  const bundles = Math.floor(qty / 6)
  const singles = qty % 6
  const items = []
  if (bundles > 0) items.push({ price_data: { currency: 'usd', product_data: { name: 'Raffle Tickets (6-pack)' }, unit_amount: 500 }, quantity: bundles })
  if (singles > 0) items.push({ price_data: { currency: 'usd', product_data: { name: 'Raffle Ticket' },          unit_amount: 100 }, quantity: singles })
  return items
}
