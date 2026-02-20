require('dotenv').config();
const express = require('express');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;
const lemonApiKey = process.env.LEMON_API_KEY;

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.post('/validate', async (req, res) => {
  try {
    if (!lemonApiKey) {
      return res.status(500).json({
        valid: false,
        message: 'Server configuration error: missing LEMON_API_KEY',
      });
    }

    const { licenseKey, deviceId } = req.body || {};

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        valid: false,
        message: 'Missing required fields: licenseKey and deviceId',
      });
    }

    const lemonResponse = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lemonApiKey}`,
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_name: deviceId,
      }),
    });

    if (!lemonResponse.ok) {
      return res.status(502).json({
        valid: false,
        message: 'License validation provider returned an error',
      });
    }

    const lemonData = await lemonResponse.json();

    if (!lemonData.valid) {
      return res.status(200).json({
        valid: false,
        message: lemonData.error || 'Invalid license key',
      });
    }

    const activationUsage = Number(lemonData.license_key?.activation_usage ?? 0);
    const activationLimit = Number(lemonData.license_key?.activation_limit ?? 0);

    if (activationLimit > 0 && activationUsage > activationLimit) {
      return res.status(200).json({
        valid: false,
        message: `Activation limit exceeded (${activationUsage}/${activationLimit})`,
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'License is valid',
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Internal server error',
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  return res.status(500).json({
    valid: false,
    message: 'Unexpected server error',
  });
});

app.listen(port, () => {
  console.log(`License validation server listening on port ${port}`);
});
