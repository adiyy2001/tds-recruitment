# Currency Converter - TDS Angular Assignment

Simple currency conversion tool built with Angular.

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- Angular CLI: `npm install -g @angular/cli`

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/adiyy2001/tds-recruitment.git
   cd tds-recruitment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API Key**

   Create `src/environments/environment.ts`:

   ```typescript
   export const environment = {
     production: false,
     apiKey: 'YOUR_API_KEY_HERE'
   };
   ```

   Get your API key from [CurrencyBeacon](https://currencybeacon.com/register)

4. **Run the application**

   ```bash
   ng serve
   ```

   Open browser: `http://localhost:4200`

## Features

- Select currencies from dropdown lists
- Input amount to convert
- Real-time conversion via CurrencyBeacon API
- Error handling
