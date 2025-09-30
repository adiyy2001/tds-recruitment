import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges,
  TrackByFunction
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Currency } from '../../types/currency.types';

@Component({
  selector: 'app-currency-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.loading]': 'isLoading()',
    role: 'combobox'
  }
})
export class CurrencySelectorComponent implements OnInit, OnChanges {
  @Input({ required: true }) currencies: readonly Currency[] = [];
  @Input({ required: true }) label!: string;
  @Input({ required: true }) inputId!: string;
  @Input() value: string = '';

  @Output() readonly valueChange: EventEmitter<string> = new EventEmitter<string>();

  readonly selectedValue: ReturnType<typeof signal<string>> = signal<string>('');
  readonly isLoading: ReturnType<typeof signal<boolean>> = signal<boolean>(false);

  readonly trackByCurrency: TrackByFunction<Currency> = (_index: number, currency: Currency) => currency.short_code;

  ngOnInit(): void {
    this.selectedValue.set(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.selectedValue.set(this.value);
    }
  }

  onSelectionChange(value: string): void {
    this.selectedValue.set(value);
    this.valueChange.emit(value);
  }
}
