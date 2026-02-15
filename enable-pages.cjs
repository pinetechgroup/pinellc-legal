const https = require('https');
const { execSync } = require('child_process');

const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8'
});
const lines = cred.split('\n');
const user = lines.find(l => l.startsWith('username=')).split('=')[1];
const pass = lines.find(l => l.startsWith('password=')).split('=')[1];
const auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');

const data = JSON.stringify({
  source: { branch: 'main', path: '/' }
});

const opts = {
  hostname: 'api.github.com',
  path: '/repos/pinetechgroup/pinellc-legal/pages',
  method: 'POST',
  headers: {
    'User-Agent': 'node',
    'Authorization': auth,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Accept': 'application/vnd.github+json'
  }
};

const req = https.request(opts, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const parsed = JSON.parse(body);
    console.log('URL:', parsed.html_url || parsed.message);
  });
});
req.write(data);
req.end();
