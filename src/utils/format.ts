/**
 * Formats a numeric value into a localized currency string.
 * Special Logic for IDR: If the value is suspicious (small like USD), it converts it using a fixed rate.
 */
export function formatCurrency(value: number, currency: string = 'IDR'): string {
    let finalValue = value;

    // Heuristic: If currency is IDR and value is < 10000, it's likely a USD value from AI
    if (currency === 'IDR' && value < 10000) {
        finalValue = value * 16000;
    }

    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(finalValue);
    } catch (e) {
        // Fallback for extreme cases
        return `${currency} ${finalValue.toLocaleString()}`;
    }
}
