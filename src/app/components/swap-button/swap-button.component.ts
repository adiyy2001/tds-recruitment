import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-swap-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swap-button.component.html',
  styleUrl: './swap-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent {
  @Output() swap: EventEmitter<void> = new EventEmitter<void>();
}
