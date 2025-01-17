import { Currency } from '../../types/common';

// We would normally use a real API, but for demo purposes we'll use static rates
const EXCHANGE_RATES: { [key: string]: { [key: string]: number } } = {
  USD: {
    EUR: 0.85,
    TRY: 30.50,
    GBP: 0.73,
    JPY: 110.0,
  },
  EUR: {
    USD: 1.18,
    TRY: 35.80,
    GBP: 0.86,
    JPY: 129.5,
  },
  TRY: {
    USD: 0.033,
    EUR: 0.028,
    GBP: 0.024,
    JPY: 3.62,
  },
  GBP: {
    USD: 1.37,
    EUR: 1.16,
    TRY: 41.60,
    JPY: 150.0,
  },
  JPY: {
    USD: 0.0091,
    EUR: 0.0077,
    TRY: 0.28,
    GBP: 0.0067,
  },
};

export class CurrencyService {
  static convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number {
    if (fromCurrency.code === toCurrency.code) {
      return amount;
    }

    const rate = EXCHANGE_RATES[fromCurrency.code]?.[toCurrency.code];
    if (!rate) {
      throw new Error(`No conversion rate found for ${fromCurrency.code} to ${toCurrency.code}`);
    }

    return amount * rate;
  }
} 