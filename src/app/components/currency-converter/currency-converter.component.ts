import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject, switchMap, takeUntil, Observable } from 'rxjs';

import { CurrencyService } from '../../services/currency.service';
import { Currency, ConversionRequest } from '../../types/currency.types';

import { CurrencySelectorComponent } from '../currency-selector/currency-selector.component';
import { AmountInputComponent } from '../amount-input/amount-input.component';
import { SwapButtonComponent } from '../swap-button/swap-button.component';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule,
    CurrencySelectorComponent,
    AmountInputComponent,
    SwapButtonComponent
  ],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  readonly #currencyService: CurrencyService = inject(CurrencyService);
  readonly #conversionSubject: Subject<void> = new Subject<void>();
  readonly #destroy$: Subject<void> = new Subject<void>();

readonly currencies: ReturnType<typeof signal<readonly Currency[]>> = signal<readonly Currency[]>([]);
readonly fromCurrency: ReturnType<typeof signal<string>> = signal<string>('USD');
readonly toCurrency: ReturnType<typeof signal<string>> = signal<string>('EUR');
readonly fromAmount: ReturnType<typeof signal<number>> = signal<number>(100);
readonly toAmount: ReturnType<typeof signal<number | null>> = signal<number | null>(null);
readonly isConverting: ReturnType<typeof signal<boolean>> = signal<boolean>(false);
readonly errorMessage: ReturnType<typeof signal<string>> = signal<string>('');

readonly exchangeRate: ReturnType<typeof computed<string | null>> = computed(() => {
  const from: number = this.fromAmount();
  const to: number | null = this.toAmount();
  if (!from || !to) return null;
  return (to / from).toFixed(4);
});

  constructor() {
    effect(() => {
      if (this.fromCurrency() && this.toCurrency() && this.fromAmount() > 0) {
        this.#conversionSubject.next();
      }
    });
  }

  ngOnInit(): void {
    this.#loadCurrencies();
    this.#setupConversionPipeline();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  #loadCurrencies(): void {
    this.#currencyService.getCurrencies()
      .pipe(takeUntil(this.#destroy$))
      .subscribe((currencies: readonly Currency[]) => {
        this.currencies.set(currencies);

        if (!currencies.find((c: Currency) => c.short_code === this.fromCurrency())) {
          this.fromCurrency.set(currencies[0]?.short_code ?? '');
        }
        if (!currencies.find((c: Currency) => c.short_code === this.toCurrency())) {
          this.toCurrency.set(currencies[1]?.short_code ?? '');
        }
      });
  }

  #setupConversionPipeline(): void {
    this.#conversionSubject
      .pipe(
        debounceTime(500),
        switchMap((): Observable<number | null> => {
          this.isConverting.set(true);
          this.errorMessage.set('');
          const request: ConversionRequest = {
            from: this.fromCurrency(),
            to: this.toCurrency(),
            amount: this.fromAmount()
          };
          return this.#currencyService.convertCurrency(request);
        }),
        takeUntil(this.#destroy$)
      )
      .subscribe({
        next: (value: number | null): void => {
          this.isConverting.set(false);
          if (value !== null) {
            this.toAmount.set(Math.round(value * 100) / 100);
          } else {
            this.errorMessage.set('Conversion failed. Please try again.');
            this.toAmount.set(null);
          }
        },
        error: (): void => {
          this.isConverting.set(false);
          this.errorMessage.set('An error occurred. Please try again.');
          this.toAmount.set(null);
        }
      });
  }

  onFromCurrencyChange(currency: string): void {
    this.fromCurrency.set(currency);
  }

  onToCurrencyChange(currency: string): void {
    this.toCurrency.set(currency);
  }

  onFromAmountChange(amount: number): void {
    this.fromAmount.set(amount);
  }

  swapCurrencies(): void {
    const temp: string = this.fromCurrency();
    this.fromCurrency.set(this.toCurrency());
    this.toCurrency.set(temp);
  }
}
