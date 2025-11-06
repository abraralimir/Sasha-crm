export type ExchangeRates = {
    [key: string]: number;
};

// Simple in-memory cache to avoid fetching rates on every render
let cachedRates: { rates: ExchangeRates; timestamp: number } | null = null;
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

export async function getExchangeRates(base: 'USD' | 'AED' | 'INR'): Promise<ExchangeRates> {
    const now = Date.now();
    if (cachedRates && (now - cachedRates.timestamp < CACHE_DURATION_MS)) {
        return cachedRates.rates;
    }

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
        }
        const data = await response.json();
        
        // The API returns rates to convert FROM the base currency.
        // For our use case (converting TO base), we need the inverse.
        // The Frankfurter API format for `latest?from=USD` is { "rates": { "EUR": 0.9, "GBP": 0.8 }}
        // This means 1 USD = 0.9 EUR. To convert EUR to USD, we do EUR / 0.9.
        // So, the rates are what we need to divide by.
        const rates: ExchangeRates = data.rates;

        cachedRates = {
            rates: rates,
            timestamp: now,
        };
        
        return rates;
    } catch (error) {
        console.error("Currency conversion API error:", error);
        // Return stale data if available, otherwise throw
        if (cachedRates) return cachedRates.rates;
        throw error;
    }
}
