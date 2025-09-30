import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly baseUrl: string = environment.apiUrl;
  protected readonly apiKey: string = environment.apiKey;

  protected createParams(additionalParams: Record<string, string | number> = {}): HttpParams {
    let params: HttpParams = new HttpParams().set('api_key', this.apiKey);

    Object.entries(additionalParams).forEach(([key, value]: [string, string | number]) => {
      params = params.set(key, value.toString());
    });

    return params;
  }

  protected handleError<T>(operation: string = 'operation', fallback?: T): (error: HttpErrorResponse) => Observable<T> {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error.message);

      return fallback !== undefined ? of(fallback) : throwError(() => error);
    };
  }

  protected validateResponse<T>(
    response: unknown,
    validator: (data: unknown) => data is T
  ): T | null {
    if (!response || !validator(response)) {
      console.warn('Invalid response format:', response);
      return null;
    }
    return response;
  }
}
