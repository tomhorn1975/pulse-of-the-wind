export interface RaffleItem {
  id: string
  name: string
  description: string | null
  photo_url: string | null
  estimated_value: number | null
  raffle_date: string | null
  is_active: boolean
  created_at: string
  ticket_count?: number
}

export interface TicketPurchase {
  id: string
  item_id: string
  buyer_name: string
  buyer_email: string
  quantity: number
  ticket_numbers: string[]
  stripe_session_id: string | null
  amount_paid: number
  status: 'pending' | 'confirmed'
  created_at: string
  raffle_items?: RaffleItem
}
