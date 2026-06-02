-- ============================================================
-- NexusPay - Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with public user data
-- ============================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  currency     TEXT NOT NULL DEFAULT 'USD',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: categories
-- User-defined payment categories (Vivienda, Servicios, etc.)
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT NOT NULL DEFAULT 'circle',  -- Lucide icon name
  color       TEXT NOT NULL DEFAULT '#3B82F6', -- Hex color
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories for new users
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, description, icon, color) VALUES
    (NEW.id, 'Vivienda',   'Alquiler, servicios, hogar',   'home',        '#3B82F6'),
    (NEW.id, 'Servicios',  'Luz, agua, internet',           'zap',         '#10B981'),
    (NEW.id, 'Ocio',       'Cine, cenas, viajes',           'clapperboard','#F59E0B'),
    (NEW.id, 'Salud',      'Farmacia, consultas',           'shield-plus',  '#EF4444'),
    (NEW.id, 'Transporte', 'Combustible, seguro auto',      'car',         '#8B5CF6'),
    (NEW.id, 'Suscripción','Netflix, Spotify, apps',        'tv',          '#EC4899');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();

-- ============================================================
-- TABLE: spaces
-- Shared payment groups (e.g., "Mi Casa", "Oficina")
-- ============================================================
CREATE TABLE public.spaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: space_members
-- Junction table: users ↔ spaces (many-to-many)
-- ============================================================
CREATE TABLE public.space_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id   UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (space_id, user_id)
);

-- Auto-add owner as member when space is created
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_space_created
  AFTER INSERT ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- ============================================================
-- TABLE: payments
-- Core payments table. Belongs to a user OR a space.
-- ============================================================
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id        UUID REFERENCES public.spaces(id) ON DELETE SET NULL, -- NULL = personal
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency        TEXT NOT NULL DEFAULT 'USD',
  due_day         SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- Day of month
  is_recurring    BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: payment_entries
-- One record per payment per month (the actual occurrence).
-- Recurring payments generate a new entry each month.
-- ============================================================
CREATE TABLE public.payment_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year            SMALLINT NOT NULL,
  month           SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,            -- NULL = pending, set when marked paid
  paid_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_method  TEXT,                  -- 'debit', 'transfer', 'cash', 'auto', etc.
  amount_paid     NUMERIC(12, 2),        -- Actual amount paid (can differ from scheduled)
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'overdue', 'scheduled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payment_id, year, month)       -- One entry per payment per month
);

-- ============================================================
-- TABLE: space_invitations
-- Pending invites to join a space via email
-- ============================================================
CREATE TABLE public.space_invitations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id    UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  invited_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  token       UUID NOT NULL DEFAULT uuid_generate_v4(),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_invitations ENABLE ROW LEVEL SECURITY;

-- profiles: users can only see/edit their own profile
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- categories: users manage their own categories
CREATE POLICY "categories: own all" ON public.categories
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- spaces: visible to members
CREATE POLICY "spaces: member read" ON public.spaces FOR SELECT
  USING (id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid()));
CREATE POLICY "spaces: owner update" ON public.spaces FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY "spaces: owner delete" ON public.spaces FOR DELETE
  USING (owner_id = auth.uid());
CREATE POLICY "spaces: authenticated insert" ON public.spaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- space_members: readable by all members of the space
CREATE POLICY "space_members: member read" ON public.space_members FOR SELECT
  USING (
    space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  );
CREATE POLICY "space_members: owner manage" ON public.space_members FOR ALL
  USING (
    space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

-- payments: own payments + payments in shared spaces
CREATE POLICY "payments: own read" ON public.payments FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  );
CREATE POLICY "payments: own write" ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments: own update" ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "payments: own delete" ON public.payments FOR DELETE
  USING (auth.uid() = user_id);

-- payment_entries: same as payments (shared space members can see and mark paid)
CREATE POLICY "entries: member read" ON public.payment_entries FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    payment_id IN (
      SELECT id FROM public.payments
      WHERE space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "entries: member update" ON public.payment_entries FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    payment_id IN (
      SELECT id FROM public.payments
      WHERE space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "entries: own insert" ON public.payment_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- space_invitations: inviter and invitee (by email match) can see
CREATE POLICY "invitations: own read" ON public.space_invitations FOR SELECT
  USING (
    invited_by = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "invitations: own insert" ON public.space_invitations FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_payments_user_id         ON public.payments(user_id);
CREATE INDEX idx_payments_space_id        ON public.payments(space_id);
CREATE INDEX idx_payment_entries_payment  ON public.payment_entries(payment_id);
CREATE INDEX idx_payment_entries_user     ON public.payment_entries(user_id);
CREATE INDEX idx_payment_entries_month    ON public.payment_entries(year, month);
CREATE INDEX idx_payment_entries_status   ON public.payment_entries(status);
CREATE INDEX idx_space_members_user       ON public.space_members(user_id);
CREATE INDEX idx_space_members_space      ON public.space_members(space_id);
