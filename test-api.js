const https = require('https');

const data = JSON.stringify({
  email: 'test@example.com',
  channel: '@durov',
  model: 'llama-3.3-70b-versatile'
});

const options = {
  hostname: 'quint-backend-xq3u.onrender.com',
  path: '/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      const fs = require('fs');
      fs.writeFileSync('backend-response.json', JSON.stringify(parsed, null, 2));
      console.log('Written to backend-response.json');
    } catch (e) {
      console.log('Raw Body:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
