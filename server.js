const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const LEMON_API_KEY = process.env.LEMON_API_KEY;
const LEMON_API_BASE_URL = 'https://api.lemonsqueezy.com/v1/licenses';

app.use(express.json({ limit: '32kb' }));

app.post('/validate', async (req, res, next) => {
  try {
    if (!LEMON_API_KEY) {
      return res.status(500).json({
        valid: false,
        message: 'Server misconfiguration: missing LEMON_API_KEY.'
      });
    }

    const { licenseKey, deviceId } = req.body || {};

    if (
      typeof licenseKey !== 'string' ||
      typeof deviceId !== 'string' ||
      !licenseKey.trim() ||
      !deviceId.trim()
    ) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid request. Expected JSON body: { licenseKey, deviceId }.'
      });
    }

    const validateResponse = await fetch(`${LEMON_API_BASE_URL}/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_key: licenseKey.trim(),
        instance_name: deviceId.trim()
      })
    });

    const validateData = await safeJson(validateResponse);

    if (!validateResponse.ok) {
      const apiMessage =
        validateData?.error ||
        validateData?.message ||
        `LemonSqueezy validation failed with status ${validateResponse.status}.`;

      return res.status(502).json({ valid: false, message: apiMessage });
    }

    if (!validateData?.valid) {
      return res.status(200).json({
        valid: false,
        message: validateData?.error || 'License key is invalid.'
      });
    }

    const activateResponse = await fetch(`${LEMON_API_BASE_URL}/activate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_key: licenseKey.trim(),
        instance_name: deviceId.trim()
      })
    });

    const activateData = await safeJson(activateResponse);

    if (!activateResponse.ok) {
      const apiMessage =
        activateData?.error ||
        activateData?.message ||
        `LemonSqueezy activation failed with status ${activateResponse.status}.`;

      return res.status(502).json({ valid: false, message: apiMessage });
    }

    if (!activateData?.activated) {
      const activationLimit = activateData?.license_key?.activation_limit;
      const activationUsage = activateData?.license_key?.activation_usage;
      const limitMessage =
        activationLimit !== undefined && activationUsage !== undefined
          ? `Activation limit reached (${activationUsage}/${activationLimit}).`
          : 'Activation was denied.';

      return res.status(200).json({
        valid: false,
        message: activateData?.error || limitMessage
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'License is valid and activated for this device.'
    });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  return res.status(404).json({
    valid: false,
    message: 'Route not found.'
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);

  return res.status(500).json({
    valid: false,
    message: 'Internal server error.'
  });
});

async function safeJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

app.listen(PORT, () => {
  console.log(`License server listening on port ${PORT}`);
});
