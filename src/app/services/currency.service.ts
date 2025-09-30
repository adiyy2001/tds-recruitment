import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, retry, tap, shareReplay, of, map, catchError } from "rxjs";
import { Currency, ConversionRequest, ConversionResponse, CurrenciesResponse } from "../types/currency.types";
import { BaseApiService } from "./base-api.service";

const ENDPOINTS: { readonly currencies: string; readonly convert: string } = {
  currencies: 'currencies',
  convert: 'convert',
} as const;

export class CurrencyError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
  }
}

function withDefaultRetry<T>(count = 2) {
  return (source: Observable<T>): Observable<T> => source.pipe(retry(count));
}

@Injectable({
  providedIn: 'any',
})
export class CurrencyService extends BaseApiService {
  #currenciesCache$?: Observable<readonly Currency[]>;

  getCurrencies(): Observable<readonly Currency[]> {
    if (!this.#currenciesCache$) {
      this.#currenciesCache$ = this.#fetchCurrencies().pipe(
        tap(() => console.debug('[CurrencyService] Currencies fetched')),
        shareReplay(1)
      );
    }
    return this.#currenciesCache$;
  }

  convertCurrency(request: ConversionRequest): Observable<number | null> {
    if (!this.#isValidConversionRequest(request)) {
      return of(null);
    }

    const params: HttpParams = this.createParams({
      from: request.from,
      to: request.to,
      amount: request.amount,
    });

    return this.http
      .get<ConversionResponse>(`${this.baseUrl}/${ENDPOINTS.convert}`, { params })
      .pipe(
        withDefaultRetry(1),
        map((response: ConversionResponse) => this.#validateConversionResponse(response)),
        catchError(this.handleError('convertCurrency', null))
      );
  }

  refreshCurrencies(): void {
    this.#currenciesCache$ = undefined;
  }

  #fetchCurrencies(): Observable<readonly Currency[]> {
    const params: HttpParams = this.createParams();


    return this.http
      .get<CurrenciesResponse>(`${this.baseUrl}/${ENDPOINTS.currencies}`, { params })
      .pipe(
        withDefaultRetry(),
        map((response: unknown) => this.#validateCurrenciesResponse(response)),
        catchError(this.handleError('getCurrencies', []))
      );
  }

  #isCurrenciesResponse(response: unknown): response is CurrenciesResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'response' in response &&
      Array.isArray((response as { response?: unknown }).response)
    );
  }

  #validateCurrenciesResponse(response: unknown): readonly Currency[] {
    return this.#isCurrenciesResponse(response) ? response.response : [];
  }

  #validateConversionResponse(response: ConversionResponse): number | null {
    const value: unknown = response?.response?.value;
    return typeof value === 'number' ? value : null;
  }

  #isValidConversionRequest(request: ConversionRequest): boolean {
    return !!(
      request.from &&
      request.to &&
      request.amount > 0 &&
      request.from !== request.to
    );
  }

  protected override handleError<T>(operation?: string, fallback?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(
        `[CurrencyService] ${operation ?? 'operation'} failed: ${error.message}`
      );
      return of(fallback as T);
    };
  }
}
