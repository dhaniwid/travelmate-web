import { useState, useEffect } from 'react';

interface CurrencyInfo {
    currency: 'IDR' | 'USD';
    symbol: 'Rp' | '$';
    isIDR: boolean;
    isLoading: boolean;
}

export function useCurrency(): CurrencyInfo {
    const [info, setInfo] = useState<CurrencyInfo>({
        currency: 'USD',
        symbol: '$',
        isIDR: false,
        isLoading: true,
    });

    useEffect(() => {
        async function detectCurrency() {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data.country_code === 'ID') {
                    setInfo({
                        currency: 'IDR',
                        symbol: 'Rp',
                        isIDR: true,
                        isLoading: false,
                    });
                } else {
                    setInfo({
                        currency: 'USD',
                        symbol: '$',
                        isIDR: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Failed to detect currency:', error);
                // Fallback to USD
                setInfo({
                    currency: 'USD',
                    symbol: '$',
                    isIDR: false,
                    isLoading: false,
                });
            }
        }

        detectCurrency();
    }, []);

    return info;
}
