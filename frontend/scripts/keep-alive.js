const http = require('http');
const https = require('https');

// Read the backend URL from environment or fallback to localhost
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const pingInterval = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15 mins)

console.log(`[Keep-Alive] Starting keep-alive daemon. Targeting: ${backendUrl} (every 14 minutes)`);

function ping() {
  const url = `${backendUrl}/health`;
  const client = url.startsWith('https') ? https : http;
  
  console.log(`[Keep-Alive] Pinging ${url}...`);
  client.get(url, (res) => {
    console.log(`[Keep-Alive] Response from ${url}: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] Ping to ${url} failed:`, err.message);
  });
}

// Initial ping after 5 seconds to let the server start up
setTimeout(ping, 5000);

// Recurring ping
setInterval(ping, pingInterval);
