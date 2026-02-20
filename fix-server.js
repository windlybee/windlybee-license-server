const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

if (!fs.existsSync(serverPath)) {
  throw new Error('server.js not found in repository root.');
}

const dotenvLine = "require('dotenv').config();";
const debugLine = 'console.log("Loaded LemonSqueezy API Key:", process.env.LEMON_API_KEY);';

const original = fs.readFileSync(serverPath, 'utf8');
const lines = original.split(/\r?\n/);

const cleanedLines = lines.filter((line) => {
  const trimmed = line.trim();

  if (trimmed === dotenvLine) {
    return false;
  }

  if (trimmed === debugLine) {
    return false;
  }

  return true;
});

const correctedLines = [dotenvLine, debugLine, '', ...cleanedLines];

const corrected = correctedLines.join('\n').replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(serverPath, `${corrected.trimEnd()}\n`, 'utf8');
console.log('server.js has been corrected successfully.');
