const https = require('https');
const { execSync } = require('child_process');

// Get stored GitHub credentials
const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8'
});
const lines = cred.split('\n');
const user = lines.find(l => l.startsWith('username=')).split('=')[1];
const pass = lines.find(l => l.startsWith('password=')).split('=')[1];

const data = JSON.stringify({
  name: 'pinellc-legal',
  description: 'Legal pages for Pine LLC QuickBooks Integration',
  homepage: 'https://pinetechgroup.github.io/pinellc-legal/',
  auto_init: false,
  private: false
});

const opts = {
  hostname: 'api.github.com',
  path: '/user/repos',
  method: 'POST',
  headers: {
    'User-Agent': 'node',
    'Authorization': 'Basic ' + Buffer.from(user + ':' + pass).toString('base64'),
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(opts, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const parsed = JSON.parse(body);
    if (res.statusCode === 201) {
      console.log('Repo created:', parsed.html_url);
    } else {
      console.log('Error:', parsed.message);
      if (parsed.errors) console.log('Details:', JSON.stringify(parsed.errors));
    }
  });
});
req.write(data);
req.end();
