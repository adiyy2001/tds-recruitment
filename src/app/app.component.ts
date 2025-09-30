import { Component } from '@angular/core';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyConverterComponent],
  template: `<app-currency-converter />`,
  styles: []
})
export class AppComponent {}
