-- ============================================================
-- NexusPay — Fix currency data migration
-- Run this in your Supabase SQL Editor
--
-- CONTEXT: A bug in createPayment() hardcoded currency='USD'
-- for all payments, regardless of what the user selected.
-- As a result every payment in the DB has currency='USD'.
--
-- OPTION A — Set ALL payments to COP (use if all your
--            payments were intended to be in COP pesos).
-- ============================================================

-- Preview first (uncomment to check before running):
-- SELECT id, name, amount, currency FROM payments ORDER BY created_at;

-- Option A: reset everything to COP
UPDATE payments SET currency = 'COP' WHERE currency = 'USD';

-- ============================================================
-- OPTION B — If you know which payments are truly in USD,
-- run Option A first (reset all to COP), then manually set
-- the ones that are USD back:
-- ============================================================

-- Example: set a specific payment back to USD by ID:
-- UPDATE payments SET currency = 'USD' WHERE id = '<your-payment-id>';

-- ============================================================
-- After running: refresh your app — the dashboard will now
-- read the corrected currencies and convert properly.
-- ============================================================
