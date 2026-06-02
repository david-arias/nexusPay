-- ============================================================
-- Fix: infinite recursion in space_members RLS policy
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "space_members: member read" ON public.space_members;
DROP POLICY IF EXISTS "space_members: owner manage" ON public.space_members;
DROP POLICY IF EXISTS "spaces: member read" ON public.spaces;
DROP POLICY IF EXISTS "payments: own read" ON public.payments;
DROP POLICY IF EXISTS "entries: member read" ON public.payment_entries;
DROP POLICY IF EXISTS "entries: member update" ON public.payment_entries;

-- 2. Create a SECURITY DEFINER helper function
--    This bypasses RLS when checking membership, breaking the recursion.
CREATE OR REPLACE FUNCTION public.is_space_member(p_space_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.space_members
    WHERE space_id = p_space_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_space_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT space_id FROM public.space_members WHERE user_id = p_user_id;
$$;

-- 3. Re-create space_members policies using the helper (no self-reference)
CREATE POLICY "space_members: member read" ON public.space_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    space_id IN (SELECT public.user_space_ids(auth.uid()))
  );

CREATE POLICY "space_members: owner manage" ON public.space_members
  FOR ALL USING (
    space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

-- 4. Re-create spaces policy
CREATE POLICY "spaces: member read" ON public.spaces
  FOR SELECT USING (
    id IN (SELECT public.user_space_ids(auth.uid()))
  );

-- 5. Re-create payments policies
CREATE POLICY "payments: own read" ON public.payments
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    space_id IN (SELECT public.user_space_ids(auth.uid()))
  );

-- 6. Re-create payment_entries policies
CREATE POLICY "entries: member read" ON public.payment_entries
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    payment_id IN (
      SELECT id FROM public.payments
      WHERE space_id IN (SELECT public.user_space_ids(auth.uid()))
    )
  );

CREATE POLICY "entries: member update" ON public.payment_entries
  FOR UPDATE USING (
    user_id = auth.uid()
    OR
    payment_id IN (
      SELECT id FROM public.payments
      WHERE space_id IN (SELECT public.user_space_ids(auth.uid()))
    )
  );
