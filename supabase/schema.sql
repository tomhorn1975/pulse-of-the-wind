-- Run this in your Supabase SQL editor

-- Raffle items table
create table raffle_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  photo_url       text,
  estimated_value numeric(10,2),
  raffle_date     date,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- Ticket purchases table
create table ticket_purchases (
  id                 uuid primary key default gen_random_uuid(),
  item_id            uuid references raffle_items(id) on delete cascade,
  buyer_name         text not null,
  buyer_email        text not null,
  quantity           integer not null check (quantity > 0),
  ticket_numbers     text[] not null default '{}',
  stripe_session_id  text unique,
  amount_paid        integer not null,   -- in cents
  status             text not null default 'pending' check (status in ('pending','confirmed')),
  created_at         timestamptz default now()
);

-- Sequence tracker for ticket numbers per item
create table ticket_sequences (
  item_id     uuid primary key references raffle_items(id) on delete cascade,
  next_number integer not null default 1
);

-- Auto-create sequence row when item is inserted
create or replace function init_ticket_sequence()
returns trigger language plpgsql as $$
begin
  insert into ticket_sequences (item_id, next_number) values (new.id, 1);
  return new;
end;
$$;

create trigger after_item_insert
  after insert on raffle_items
  for each row execute function init_ticket_sequence();

-- Function to atomically allocate ticket numbers
create or replace function allocate_tickets(p_item_id uuid, p_quantity integer)
returns text[] language plpgsql as $$
declare
  v_start  integer;
  v_numbers text[] := '{}';
  v_item_name text;
  i integer;
begin
  select name into v_item_name from raffle_items where id = p_item_id;
  update ticket_sequences set next_number = next_number + p_quantity
    where item_id = p_item_id
    returning next_number - p_quantity into v_start;
  for i in 0..(p_quantity - 1) loop
    v_numbers := array_append(v_numbers, 'POW-' || lpad((v_start + i)::text, 5, '0'));
  end loop;
  return v_numbers;
end;
$$;

-- Row-level security: public can read active items
alter table raffle_items enable row level security;
create policy "Public read active items" on raffle_items for select using (is_active = true);
create policy "Admin all items"          on raffle_items for all using (auth.role() = 'authenticated');

alter table ticket_purchases enable row level security;
create policy "Admin all purchases" on ticket_purchases for all using (auth.role() = 'authenticated');
-- Service role bypasses RLS for webhook use

-- Storage bucket for item photos
-- Run this after creating the table:
-- insert into storage.buckets (id, name, public) values ('raffle-photos', 'raffle-photos', true);
