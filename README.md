# Windlybee License Server

Production-ready Node.js + Express license validation server backed by LemonSqueezy.

## Features

- `POST /validate` endpoint
- Accepts JSON payload `{ "licenseKey": "...", "deviceId": "..." }`
- Validates licenses with LemonSqueezy API
- Activates a device and enforces activation limits through LemonSqueezy
- Uses environment variables `LEMON_API_KEY` and `PORT`
- Returns consistent JSON responses:
  - `{ "valid": true, "message": "..." }`
  - `{ "valid": false, "message": "..." }`

## Prerequisites

- Node.js 18+
- LemonSqueezy API key with permission to validate/activate licenses

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables:

   ```bash
   export LEMON_API_KEY="your_lemon_api_key"
   export PORT=3000
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Test endpoint:

   ```bash
   curl -X POST http://localhost:3000/validate \
     -H "Content-Type: application/json" \
     -d '{"licenseKey":"YOUR_LICENSE_KEY","deviceId":"DEVICE_001"}'
   ```

## Deploy on Render

1. Push this project to a Git repository.
2. In Render, click **New +** → **Web Service**.
3. Connect your repository.
4. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in Render:
   - `LEMON_API_KEY`: your LemonSqueezy API key
   - `PORT`: Render injects this automatically (optional to define manually)
6. Deploy the service.

Render will assign a URL such as `https://your-service.onrender.com`.

## API Contract

### `POST /validate`

**Request Body**

```json
{
  "licenseKey": "string",
  "deviceId": "string"
}
```

**Success Response**

```json
{
  "valid": true,
  "message": "License is valid and activated for this device."
}
```

**Failure Response**

```json
{
  "valid": false,
  "message": "Reason for failure"
}
```
