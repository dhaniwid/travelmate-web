import { useState, useEffect } from 'react';

interface CurrencyInfo {
    currency: 'IDR' | 'USD';
    symbol: 'Rp' | '$';
    isIDR: boolean;
    isLoading: boolean;
    isDetecting: boolean;
    error: boolean;
}

export function useCurrency(): CurrencyInfo {
    const [info, setInfo] = useState<CurrencyInfo>({
        currency: 'USD',
        symbol: '$',
        isIDR: false,
        isLoading: true,
        isDetecting: true,
        error: false,
    });

    useEffect(() => {
        const controller = new AbortController();

        async function detectCurrency() {
            try {
                const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                if (!response.ok) throw new Error('API response not ok');
                const data = await response.json();

                if (data.country_code === 'ID') {
                    setInfo({
                        currency: 'IDR',
                        symbol: 'Rp',
                        isIDR: true,
                        isLoading: false,
                        isDetecting: false,
                        error: false,
                    });
                } else {
                    setInfo({
                        currency: 'USD',
                        symbol: '$',
                        isIDR: false,
                        isLoading: false,
                        isDetecting: false,
                        error: false,
                    });
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.warn('Currency detection failed, defaulting to USD:', err);

                // Fallback to USD
                setInfo({
                    currency: 'USD',
                    symbol: '$',
                    isIDR: false,
                    isLoading: false,
                    isDetecting: false,
                    error: true,
                });
            }
        }

        detectCurrency();

        return () => {
            controller.abort();
        };
    }, []);

    return info;
}
