const http = require('http');
const fs = require('fs');

const payload = JSON.parse(fs.readFileSync('./payload.json', 'utf8'));
const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/xai',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let raw = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => raw += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(raw);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Non-JSON response:', raw);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
