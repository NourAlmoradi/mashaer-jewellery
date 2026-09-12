-- =====================================================================
-- MASHAER JEWELLERY — schema upgrade + seed. Run in Supabase → SQL Editor.
-- Idempotent. Seeds categories only; products and collections are owner-managed.
-- Upgrades an EXISTING database; put new changes in migrations/, not here.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. SCHEMA UPGRADE (brings an already-created DB up to the fixed schema)
-- ---------------------------------------------------------------------

create extension if not exists pgcrypto;

-- Categories table (was missing entirely)
create table if not exists public.categories (
  id text primary key,           -- e.g. "cat-rings" (matches old seed ids)
  slug text unique not null,     -- e.g. "rings"
  name jsonb not null,
  description jsonb,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Give collections a stable human key so products can be remapped by it
alter table public.collections add column if not exists slug text;
create unique index if not exists collections_slug_key
  on public.collections (slug);

-- Link products.category_id → categories(id)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_category_id_fkey'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id)
      on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 1b. CASCADE CLEANUP — a deleted account takes its profile, addresses,
--     wishlist and orders (with items + memories) with it. The two FKs below
--     were originally "set null", so they are dropped and re-added.
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'orders_user_id_fkey') then
    alter table public.orders drop constraint orders_user_id_fkey;
  end if;
  alter table public.orders
    add constraint orders_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
end $$;

do $$ begin
  if exists (select 1 from pg_constraint where conname = 'memories_order_id_fkey') then
    alter table public.memories drop constraint memories_order_id_fkey;
  end if;
  alter table public.memories
    add constraint memories_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete cascade;
end $$;

-- Orders: QR token columns (memory tokens minted at checkout)
alter table public.orders add column if not exists qr_tokens text[] not null default '{}';
alter table public.orders add column if not exists qr_token_labels text[] not null default '{}';
alter table public.orders add column if not exists qr_token_product_ids text[] not null default '{}';

-- Block admin self-promotion (privilege escalation fix)
create or replace function public.guard_is_admin()
returns trigger language plpgsql security definer as $$
begin
  -- auth.uid() is null only on trusted paths (SQL editor / service role);
  -- every API request carries a uid and must come from an existing admin.
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change admin status';
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_is_admin();

-- Admin allowlist: these accounts are admins — promoted now if they already
-- signed up, and auto-promoted the moment they sign up later.
create or replace function public.admin_allowlist()
returns text[] language sql immutable as $$
  select array['nourmorad312@gmail.com', 'chahinabdulaziz@gmail.com'];
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    lower(new.email) = any (public.admin_allowlist())
  );
  return new;
end $$;

update public.profiles p set is_admin = true
from auth.users u
where u.id = p.id
  and lower(u.email) = any (public.admin_allowlist())
  and not p.is_admin;

-- Categories RLS
alter table public.categories enable row level security;
drop policy if exists "anyone reads categories" on public.categories;
create policy "anyone reads categories" on public.categories
  for select using (true);
drop policy if exists "admins write categories" on public.categories;
create policy "admins write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Memories: stop public table-wide reads (data-leak fix)
drop policy if exists "anyone with token reads memory" on public.memories;
drop policy if exists "owner or admin reads memory" on public.memories;
create policy "owner or admin reads memory" on public.memories
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Public QR card: does a memory exist, and which product. Never the private
-- title / message / photos — those need unlock_memory() or RLS.
-- DROP first: CREATE OR REPLACE cannot change a function's OUT columns.
drop function if exists public.get_memory(text);
create or replace function public.get_memory(p_token text)
returns table (
  token text, order_id text, product_id uuid, product_label text,
  created_at timestamptz, updated_at timestamptz
)
language sql security definer stable as $$
  select token, order_id, product_id, product_label,
         created_at, updated_at
  from public.memories where token = p_token;
$$;

-- The one PIN-gated read path, with its own 5-try / 15-min lockout. A wrong PIN
-- RETURNS a status rather than raising: a RAISE would roll back the
-- failed-attempt UPDATE with it. DROP: the OUT columns changed.
drop function if exists public.unlock_memory(text, text);
create or replace function public.unlock_memory(p_token text, p_pin text)
returns table (
  status text, attempts_left int, minutes_left int,
  token text, order_id text, product_id uuid, product_label text,
  title text, message text, photos text[],
  created_at timestamptz, updated_at timestamptz
)
language plpgsql security definer as $$
declare
  v_locked timestamptz;
  v_attempts int;
  v_ok boolean;
  v_new int;
begin
  -- Keep every `memories` column alias-qualified: the RETURNS TABLE names are
  -- OUT variables here, so a bare `token` raises 42702 (ambiguous reference).
  select m.pin_locked_until, m.failed_pin_attempts
    into v_locked, v_attempts
  from public.memories m where m.token = p_token;

  -- Unknown token: report as a wrong PIN (get_memory already governs existence).
  if not found then
    return query select 'wrong'::text, 0, 0,
      null::text, null::text, null::uuid, null::text,
      null::text, null::text, null::text[],
      null::timestamptz, null::timestamptz;
    return;
  end if;

  -- Still inside the lock window: reject without touching the hash.
  if v_locked is not null and v_locked > now() then
    return query select 'locked'::text, 0,
      greatest(1, ceil(extract(epoch from (v_locked - now())) / 60))::int,
      null::text, null::text, null::uuid, null::text,
      null::text, null::text, null::text[],
      null::timestamptz, null::timestamptz;
    return;
  end if;

  -- Lock window has passed: clear the stale counter for a fresh set of tries.
  if v_locked is not null then
    update public.memories m
      set failed_pin_attempts = 0, pin_locked_until = null
      where m.token = p_token;
    v_attempts := 0;
  end if;

  select m.pin_hash = crypt(p_pin, m.pin_hash) into v_ok
  from public.memories m where m.token = p_token;

  if v_ok then
    update public.memories m
      set failed_pin_attempts = 0, pin_locked_until = null
      where m.token = p_token;
    return query
      select 'ok'::text, 0, 0,
             m.token, m.order_id, m.product_id, m.product_label,
             m.title, m.message, m.photos, m.created_at, m.updated_at
      from public.memories m where m.token = p_token;
  else
    v_new := v_attempts + 1;
    update public.memories m
      set failed_pin_attempts = v_new,
          pin_locked_until = case when v_new >= 5
                                  then now() + interval '15 minutes' end
      where m.token = p_token;
    if v_new >= 5 then
      return query select 'locked'::text, 0, 15,
        null::text, null::text, null::uuid, null::text,
        null::text, null::text, null::text[],
        null::timestamptz, null::timestamptz;
    else
      return query select 'wrong'::text, (5 - v_new), 0,
        null::text, null::text, null::uuid, null::text,
        null::text, null::text, null::text[],
        null::timestamptz, null::timestamptz;
    end if;
  end if;
end $$;

-- Brute-force protection: a 4-digit PIN only has 10,000 combinations, so
-- 5 wrong attempts lock the memory for 15 minutes.
alter table public.memories
  add column if not exists failed_pin_attempts int not null default 0;
alter table public.memories
  add column if not exists pin_locked_until timestamptz;

-- unlock_memory owns the PIN path now. These two were left callable over
-- PostgREST as SECURITY DEFINER, and check_memory_pin WRITES
-- failed_pin_attempts — five anonymous calls could lock out a recipient.
drop function if exists public.verify_memory_pin(text, text);
drop function if exists public.check_memory_pin(text, text);

-- Create/update a memory. Writing is the buyer's or an admin's; the PIN is a
-- READ credential for unlock_memory() only. Anyone else gets 'forbidden' as
-- DATA, so the UI can name the right account. DROP: return type changed.
drop function if exists public.save_memory(text, text, uuid, text, text, text, text, text[]);

create or replace function public.save_memory(
  p_token text, p_order_id text, p_product_id uuid, p_product_label text,
  p_pin text, p_title text, p_message text, p_photos text[]
)
returns table (status text, attempts_left int, minutes_left int)
language plpgsql security definer as $$
declare
  v_exists boolean;
  v_order_id text;
  v_idx int;
  v_prod_text text;
  v_label text;
begin
  select exists(select 1 from public.memories where token = p_token)
    into v_exists;

  if v_exists then
    -- Editing is for the buyer or an admin. A correct PIN is NOT accepted here:
    -- it only unlocks reading.
    if not (
      public.is_admin() or exists (
        select 1 from public.orders o
        join public.memories m on m.order_id = o.id
        where m.token = p_token and o.user_id = auth.uid()
      )
    ) then
      return query select 'forbidden'::text, null::int, null::int;
      return;
    end if;
    update public.memories set
      product_id    = coalesce(p_product_id, product_id),
      product_label = coalesce(p_product_label, product_label),
      title         = coalesce(p_title, ''),
      message       = coalesce(p_message, ''),
      photos        = coalesce(p_photos, '{}'),
      updated_at    = now()
    where token = p_token;
  else
    -- First-time setup: the token must be a real QR token minted on an order.
    select o.id, array_position(o.qr_tokens, p_token)
      into v_order_id, v_idx
    from public.orders o
    where p_token = any(o.qr_tokens)
    limit 1;

    if v_order_id is null and not public.is_admin() then
      raise exception 'Unknown memory token';
    end if;

    -- Claiming a blank token is the buyer's right alone. Without this check any
    -- passer-by who read the QR could create the memory and choose its PIN.
    if not public.is_admin() and not exists (
      select 1 from public.orders o
      where o.id = v_order_id and o.user_id = auth.uid()
    ) then
      return query select 'forbidden'::text, null::int, null::int;
      return;
    end if;

    -- Still required: the PIN the recipient will use to READ the memory.
    if p_pin is null or p_pin !~ '^\d{4}$' then
      raise exception 'A 4-digit PIN is required';
    end if;

    -- Derive product id / label from the order's token arrays when not supplied.
    if v_order_id is not null and v_idx is not null then
      select qr_token_product_ids[v_idx], qr_token_labels[v_idx]
        into v_prod_text, v_label
      from public.orders where id = v_order_id;
    end if;

    insert into public.memories
      (token, order_id, product_id, product_label,
       pin_hash, title, message, photos)
    values (
      p_token,
      -- p_order_id comes from the request body, so only an admin may file a
      -- memory against an order other than the one that minted the token —
      -- v_order_id is the only order the guard above proved this caller owns.
      case when public.is_admin() then coalesce(p_order_id, v_order_id)
           else v_order_id end,
      coalesce(
        p_product_id,
        case when v_prod_text ~ '^[0-9a-fA-F-]{36}$'
             then v_prod_text::uuid else null end
      ),
      coalesce(p_product_label, v_label),
      crypt(p_pin, gen_salt('bf')),
      coalesce(p_title, ''), coalesce(p_message, ''), coalesce(p_photos, '{}')
    );
  end if;

  return query select 'ok'::text, 0, 0;
end $$;

-- Admins can delete any memory (cleaves no orphaned data behind).
drop policy if exists "admins delete memories" on public.memories;
create policy "admins delete memories" on public.memories
  for delete using (public.is_admin());

-- Admin-only: reset a memory's PIN without knowing the old one.
create or replace function public.admin_reset_memory_pin(p_token text, p_pin text)
returns void
language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_pin is null or p_pin !~ '^\d{4}$' then
    raise exception 'A 4-digit PIN is required';
  end if;
  update public.memories
    set pin_hash = crypt(p_pin, gen_salt('bf')),
        failed_pin_attempts = 0, pin_locked_until = null,
        updated_at = now()
    where token = p_token;
  if not found then
    raise exception 'Unknown memory token';
  end if;
end $$;

-- Place an order atomically. The client sends only the cart, address and QR
-- choice; prices, totals, status, the order id and the tokens come from here.
-- DROP: Postgres overloads on arguments, so the old signature would survive.
drop function if exists public.place_order(
  text, text, text, jsonb, qr_choice, text[], text[], text[], jsonb, payment_method
);

-- ---------------------------------------------------------------------
-- mint_qr_token — alphabet matches generateToken() in src/lib/utils.ts: no
-- 0/o/1/l/i, since these are read off a printed card. Rejection sampling above
-- 248 (= 31 * 8) keeps the alphabet uniform, which `byte % 31` would not.
-- ---------------------------------------------------------------------
create or replace function public.mint_qr_token(p_len int default 8)
returns text
language plpgsql volatile as $$
declare
  v_chars constant text := 'abcdefghjkmnpqrstuvwxyz23456789';  -- 31 chars
  v_out text := '';
  v_byte int;
begin
  while char_length(v_out) < p_len loop
    v_byte := get_byte(gen_random_bytes(1), 0);
    -- Discard the biased tail so every character is equally likely.
    if v_byte < 248 then
      v_out := v_out || substr(v_chars, (v_byte % 31) + 1, 1);
    end if;
  end loop;
  return v_out;
end $$;

-- place_order — ids and tokens are minted here, never sent by the client.
create or replace function public.place_order(
  p_customer_name text,
  p_email text,
  p_items jsonb,                -- [{product_id,name,qty,price,variation_label}]
  p_qr_choice qr_choice,
  p_shipping_address jsonb,
  p_payment_method payment_method,
  p_locale text default 'ar'    -- language for the generated token labels
)
returns text
language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_item jsonb;
  v_pid uuid;
  v_qty int;
  v_price numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2);
  v_emirate text;
  v_rate_key text;
  v_rates jsonb;
  v_id text;
  v_tokens text[] := '{}';
  v_labels text[] := '{}';
  v_prod_ids text[] := '{}';
  v_token text;
  v_locale text := case when p_locale = 'en' then 'en' else 'ar' end;
  v_base text;
  v_variation text;
  v_label text;
  v_n int;
  v_tries int;
begin
  if v_user is null then
    raise exception 'Sign in to place an order';
  end if;
  if p_customer_name is null or char_length(btrim(p_customer_name)) = 0
     or char_length(p_customer_name) > 120 then
    raise exception 'Bad customer name';
  end if;
  if p_email is null or char_length(p_email) > 255 then
    raise exception 'Bad email';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order has no items';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many line items';
  end if;

  -- Validate every line against the catalog: the product must exist and be
  -- active, and the unit price must be the base price or one of the
  -- variation price overrides. The client can never invent a price.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid   := (v_item->>'product_id')::uuid;
    v_qty   := (v_item->>'qty')::int;
    v_price := (v_item->>'price')::numeric;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'Bad quantity';
    end if;
    if not exists (
      select 1 from public.products p
      where p.id = v_pid and p.is_active
        and (
          p.price = v_price
          or exists (
            select 1
            from jsonb_array_elements(coalesce(p.variations, '[]'::jsonb)) v
            where (v->>'priceOverride')::numeric = v_price
          )
        )
    ) then
      raise exception 'Item price does not match the catalog';
    end if;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  -- --------------------------------------------------------------
  -- Shipping (see migration 0005 for the unknown-emirate reasoning)
  -- --------------------------------------------------------------
  select coalesce(data->'shipping', '{}'::jsonb) into v_rates
  from public.admin_settings where id = 1;
  v_rates := '{"dubai":0,"abuDhabi":15,"sharjah":10,"ajman":20,"ummAlQuwain":25,"rasAlKhaimah":25,"fujairah":25}'::jsonb
             || coalesce(v_rates, '{}'::jsonb);
  v_emirate := lower(coalesce(p_shipping_address->>'emirate', ''));
  v_rate_key :=
    case
      when v_emirate like '%dubai%'          or v_emirate like '%دبي%'          then 'dubai'
      when v_emirate like '%abudhabi%'       or v_emirate like '%abu dhabi%'
        or v_emirate like '%أبوظبي%'          or v_emirate like '%أبو ظبي%'       then 'abuDhabi'
      when v_emirate like '%sharjah%'        or v_emirate like '%الشارقة%'      then 'sharjah'
      when v_emirate like '%ajman%'          or v_emirate like '%عجمان%'        then 'ajman'
      when v_emirate like '%ummalquwain%'    or v_emirate like '%umm al quwain%'
        or v_emirate like '%أم القيوين%'                                        then 'ummAlQuwain'
      when v_emirate like '%rasalkhaimah%'   or v_emirate like '%ras al khaimah%'
        or v_emirate like '%رأس الخيمة%'                                        then 'rasAlKhaimah'
      when v_emirate like '%fujairah%'       or v_emirate like '%الفجيرة%'      then 'fujairah'
      else null
    end;
  if v_rate_key is null then
    raise exception 'Unknown emirate: %', coalesce(p_shipping_address->>'emirate', '(missing)');
  end if;
  v_shipping := greatest(coalesce((v_rates->>v_rate_key)::numeric, 0), 0);

  -- Retry on a collision rather than surfacing a PK violation to the customer.
  v_tries := 0;
  loop
    v_id := 'HK-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
    exit when not exists (select 1 from public.orders o where o.id = v_id);
    v_tries := v_tries + 1;
    if v_tries > 10 then
      raise exception 'Could not allocate an order id';
    end if;
  end loop;

  -- From the VALIDATED line items, never client input: one token per order,
  -- or one per unit purchased.
  if p_qr_choice = 'per_order' then
    v_tokens   := array[public.mint_qr_token()];
    v_labels   := array[case when v_locale = 'en' then 'All Items' else 'جميع المنتجات' end];
    v_prod_ids := array['all'];
  else
    for v_item in select * from jsonb_array_elements(p_items) loop
      v_qty  := (v_item->>'qty')::int;
      v_base := coalesce(v_item->'name'->>v_locale, v_item->'name'->>'en', '');
      v_variation := v_item->'variation_label'->>v_locale;

      for v_n in 1..v_qty loop
        -- Reject a duplicate against live orders and existing memories.
        loop
          v_token := public.mint_qr_token();
          exit when not exists (
            select 1 from public.orders o where v_token = any(o.qr_tokens)
          ) and not exists (
            select 1 from public.memories m where m.token = v_token
          ) and not (v_token = any(v_tokens))
          -- "demo" is a reserved token: /memory/demo renders a fixed showcase
          -- page, so a real memory must never be able to claim it (L9).
          and v_token <> 'demo';
        end loop;

        v_label := v_base
                || case when v_variation is not null then ' · ' || v_variation else '' end
                || case when v_qty > 1 then ' #' || v_n else '' end;

        v_tokens   := v_tokens   || v_token;
        v_labels   := v_labels   || v_label;
        v_prod_ids := v_prod_ids || (v_item->>'product_id');
      end loop;
    end loop;
  end if;

  insert into public.orders
    (id, user_id, customer_name, email, subtotal, shipping, total, status,
     qr_choice, qr_tokens, qr_token_labels, qr_token_product_ids,
     shipping_address, payment_method)
  values
    (v_id, v_user, btrim(p_customer_name), p_email, v_subtotal, v_shipping,
     v_subtotal + v_shipping, 'pending', p_qr_choice,
     v_tokens, v_labels, v_prod_ids, p_shipping_address, p_payment_method);

  insert into public.order_items (order_id, product_id, name, qty, price, variation_label)
  select v_id,
         (i->>'product_id')::uuid,
         i->'name',
         (i->>'qty')::int,
         (i->>'price')::numeric,
         nullif(i->'variation_label', 'null'::jsonb)
  from jsonb_array_elements(p_items) i;

  return v_id;
end $$;

-- ---------------------------------------------------------------------
-- 1c. POLICY HARDENING — the client INSERT policy on orders/order_items allowed
--     an arbitrary total, bypassing place_order() (SECURITY DEFINER, so
--     checkout is unaffected). The memory-photos owner policies never matched.
-- ---------------------------------------------------------------------
drop policy if exists "users insert own orders"     on public.orders;
drop policy if exists "insert items for own orders"  on public.order_items;
drop policy if exists "owner reads memory photos"    on storage.objects;
drop policy if exists "owner uploads memory photos"  on storage.objects;
drop policy if exists "owner deletes memory photos"  on storage.objects;

-- Memory photos are served by public URL, which needs a public bucket; set it
-- here so a fresh environment doesn't need a manual dashboard toggle. The
-- unguessable "<token>/<uuid>" path is the only capability to a photo.
insert into storage.buckets (id, name, public)
  values ('memory-photos', 'memory-photos', true)
  on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------
-- 2. SEED — CATEGORIES (string ids preserved)
-- ---------------------------------------------------------------------
insert into public.categories (id, slug, name, description, sort_order) values
  ('cat-rings',     'rings',
   '{"ar":"خواتم","en":"Rings"}'::jsonb,
   '{"ar":"خواتم بتصاميم رقيقة","en":"Delicate rings, made to be cherished"}'::jsonb, 0),
  ('cat-necklaces', 'necklaces',
   '{"ar":"قلائد","en":"Necklaces"}'::jsonb,
   '{"ar":"قلائد تحمل لحظاتك المميزة","en":"Necklaces that hold your moments"}'::jsonb, 1),
  ('cat-bracelets', 'bracelets',
   '{"ar":"أساور","en":"Bracelets"}'::jsonb,
   '{"ar":"أساور أنيقة لكل المناسبات","en":"Elegant bracelets for every moment"}'::jsonb, 2),
  ('cat-earrings',  'earrings',
   '{"ar":"أقراط","en":"Earrings"}'::jsonb,
   '{"ar":"أقراط بلمسة هادئة","en":"Earrings with a quiet touch"}'::jsonb, 3),
  ('cat-baby',      'baby',
   '{"ar":"مجوهرات الأطفال","en":"Baby Pieces"}'::jsonb,
   '{"ar":"أولى المجوهرات للحظات الأولى","en":"First pieces for first moments"}'::jsonb, 4)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name,
  description = excluded.description, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- 3. COLLECTIONS — not seeded. Owner-managed in Admin → Collections, and the
--    storefront renders fine with none. (Categories above ARE seeded: product
--    rows reference their fixed text ids and no admin screen creates them.)
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 4. PRODUCTS — not seeded. Owner-managed in Admin → Products; seeding them
--    would overwrite real edits every time this script runs.
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- 5. SEED — admin settings single row
-- ---------------------------------------------------------------------
-- The update fires only while the row still holds the placeholder, so real
-- edits survive. Contact fields stay EMPTY — the storefront hides a blank
-- channel, and a sample phone number would otherwise ship to customers.
insert into public.admin_settings (id, data) values (1, '{
  "store": {
    "email": "",
    "phone": "",
    "whatsapp": "",
    "instagram": "",
    "facebook": "",
    "address": ""
  },
  "shipping": {
    "dubai": 0, "abuDhabi": 15, "sharjah": 10, "ajman": 20,
    "ummAlQuwain": 25, "rasAlKhaimah": 25, "fujairah": 25
  }
}'::jsonb)
on conflict (id) do update set data = excluded.data
  where public.admin_settings.data = '{}'::jsonb;

commit;
