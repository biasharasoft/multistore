// Currency formatting utilities
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// Common currencies used in business applications
export const CURRENCIES: Record<string, CurrencyConfig> = {
  usd: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
  },
  eur: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
  },
  gbp: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
  },
  tzs: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    decimalPlaces: 0, // Tanzanian Shilling typically doesn't use decimals
  },
  kes: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    decimalPlaces: 2,
  },
  ugx: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling',
    decimalPlaces: 0,
  },
  ngn: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    decimalPlaces: 2,
  },
  zar: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    decimalPlaces: 2,
  },
  cad: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimalPlaces: 2,
  },
  aud: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimalPlaces: 2,
  },
  jpy: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
  },
  cny: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimalPlaces: 2,
  },
  inr: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimalPlaces: 2,
  },
};

/**
 * Format amount in cents to display with the user's preferred currency
 * @param amountInCents Amount in the smallest currency unit (cents)
 * @param currencyCode Currency code (e.g., 'usd', 'tzs')
 * @param options Formatting options
 */
export function formatCurrency(
  amountInCents: number, 
  currencyCode: string = 'tzs',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  } = {}
): string {
  const { showSymbol = true, showCode = false, locale = 'en-US' } = options;
  
  const currency = CURRENCIES[currencyCode.toLowerCase()] || CURRENCIES.tzs;
  const amount = amountInCents / 100;
  
  // For currencies without decimals, format as whole numbers
  const formattedAmount = currency.decimalPlaces === 0 
    ? Math.round(amount).toLocaleString(locale)
    : amount.toLocaleString(locale, {
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
      });

  if (showCode) {
    return `${formattedAmount} ${currency.code}`;
  }
  
  if (showSymbol) {
    return `${currency.symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
}

/**
 * Get currency configuration for a given currency code
 */
export function getCurrencyConfig(currencyCode: string = 'tzs'): CurrencyConfig {
  return CURRENCIES[currencyCode.toLowerCase()] || CURRENCIES.tzs;
}

/**
 * Get list of all supported currencies for dropdowns
 */
export function getSupportedCurrencies(): Array<{ value: string; label: string }> {
  return Object.entries(CURRENCIES).map(([code, config]) => ({
    value: code,
    label: `${config.name} (${config.code})`,
  }));
}

/**
 * Convert display amount to cents for storage
 * @param displayAmount The amount as shown to user (e.g., 100.50)
 * @param currencyCode Currency code to determine decimal places
 */
export function toCents(displayAmount: number, currencyCode: string = 'tzs'): number {
  const currency = getCurrencyConfig(currencyCode);
  
  if (currency.decimalPlaces === 0) {
    // For currencies without decimals, store as is (but multiply by 100 to maintain consistency)
    return Math.round(displayAmount * 100);
  }
  
  return Math.round(displayAmount * 100);
}

/**
 * Convert cents to display amount
 * @param amountInCents Amount in cents
 * @param currencyCode Currency code to determine decimal places  
 */
export function fromCents(amountInCents: number, currencyCode: string = 'tzs'): number {
  return amountInCents / 100;
}