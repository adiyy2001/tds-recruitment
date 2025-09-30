export interface Currency {
  id: string;
  name: string;
  short_code: string;
  code: string;
  precision: number;
  subunit: number;
  symbol: string;
  symbol_first: boolean;
  decimal_mark: string;
  thousands_separator: string;
}

export interface CurrenciesResponse {
  response: Currency[];
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
}

export interface ConversionResponse {
  meta: {
    code: number;
    disclaimer: string;
  };
  response: {
    timestamp: number;
    date: string;
    from: string;
    to: string;
    amount: number;
    value: number;
  };
}
