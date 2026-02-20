# LemonSqueezy License Validation Server

A secure Node.js Express server with a `POST /validate` endpoint for validating LemonSqueezy licenses.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file:
   ```env
   LEMON_API_KEY=your_lemonsqueezy_api_key
   PORT=3000
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API

### `POST /validate`

Request body:

```json
{
  "licenseKey": "YOUR-LICENSE-KEY",
  "deviceId": "DEVICE-123"
}
```

Response body:

```json
{
  "valid": true,
  "message": "License is valid"
}
```

The server:
- sends the license key and device ID to LemonSqueezy's validate endpoint,
- checks if the license is valid,
- enforces activation limits,
- returns a consistent JSON response `{ valid, message }`.
