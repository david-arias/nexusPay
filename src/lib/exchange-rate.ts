/**
 * Fetches the current USD → COP exchange rate from a free public API.
 * Falls back to a hardcoded rate if the fetch fails.
 */
const FALLBACK_RATE = 4100 // approx COP per 1 USD

export async function getUSDtoCOP(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=COP',
      { next: { revalidate: 3600 } } // cache 1 hour
    )
    if (!res.ok) return FALLBACK_RATE
    const data = await res.json()
    return data?.rates?.COP ?? FALLBACK_RATE
  } catch {
    return FALLBACK_RATE
  }
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatByCurrency(amount: number, currency: string): string {
  return currency === 'USD' ? formatUSD(amount) : formatCOP(amount)
}
