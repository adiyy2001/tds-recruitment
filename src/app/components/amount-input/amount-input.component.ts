import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-amount-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountInputComponent implements OnInit, OnChanges {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) inputId!: string;
  @Input() value: number | null = null;
  @Input() readonly: boolean = false;
  @Input() placeholder: `${number}` | `${number}.${number}${number}` | string = '0.00';
  @Output() readonly valueChange: EventEmitter<number> = new EventEmitter<number>();

  readonly inputValue: ReturnType<typeof signal<number | null>> = signal<number | null>(null);

  ngOnInit(): void {
    this.inputValue.set(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.inputValue.set(this.value);
    }
  }

  onValueChange(value: number): void {
    this.valueChange.emit(value);
  }
}
