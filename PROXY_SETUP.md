# Proxy Rotation Setup for Next.js

## Overview
This implementation provides legal, modern proxy rotation for Next.js applications using multiple strategies.

## Installation

```bash
npm install https-proxy-agent http-proxy-agent
# or
yarn add https-proxy-agent http-proxy-agent
# or
pnpm add https-proxy-agent http-proxy-agent
```

## Setup Steps

### 1. Configure Proxy Pool

Edit `src/lib/proxy-rotation.ts` and add your proxy configurations:

```typescript
const proxyPool: ProxyPool = {
  proxies: [
    { 
      host: 'proxy1.example.com', 
      port: 8080, 
      protocol: 'http',
      auth: { username: 'user', password: 'pass' }
    },
    // Add more proxies...
  ],
  currentIndex: 0,
};
```

### 2. Recommended Proxy Providers

**Residential Proxies (Best for Web Scraping):**
- Bright Data (Luminati): https://brightdata.com
- Oxylabs: https://oxylabs.io
- Smartproxy: https://smartproxy.com

**Datacenter Proxies (Faster, Lower Cost):**
- ProxyRack: https://www.proxyrack.com
- MyPrivateProxy: https://www.myprivateproxy.net

### 3. Environment Variables

Add to `.env.local`:

```env
# Proxy Configuration
API_ENDPOINT_1=https://api1.yourdomain.com
API_ENDPOINT_2=https://api2.yourdomain.com
API_ENDPOINT_3=https://api3.yourdomain.com

# Cloudflare Worker (optional)
CLOUDFLARE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

### 4. Usage Examples

#### Basic Usage:
```typescript
import { fetchWithProxy } from '@/lib/proxy-rotation';

const response = await fetchWithProxy('https://api.example.com/data');
const data = await response.json();
```

#### With Options:
```typescript
const response = await fetchWithProxy('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'test' }),
});
```

### 5. Alternative Methods

#### Region Rotation (Vercel):
Deploy edge functions in different regions - automatically rotates IPs:
```typescript
import { fetchWithRegionRotation } from '@/lib/proxy-rotation';

const response = await fetchWithRegionRotation('https://api.example.com/data');
```

#### Cloudflare Workers:
Deploy fetch endpoint as Cloudflare Worker for automatic IP rotation:
```typescript
import { fetchWithCloudflareRotation } from '@/lib/proxy-rotation';

const response = await fetchWithCloudflareRotation('https://api.example.com/data');
```

### 6. Vercel Deployment Configuration

Create `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "regions": ["iad1", "sfo1", "hnd1", "syd1", "fra1"]
    }
  }
}
```

This deploys API routes in multiple regions, naturally rotating IPs.

## Legal Considerations

⚠️ **Important:**
1. Only use proxies for legitimate purposes
2. Respect robots.txt and rate limits
3. Obtain proper authorization for scraping
4. Comply with website terms of service
5. Use residential proxies for high-volume scenarios

## Best Practices

1. **Rate Limiting**: Add delays between requests
2. **Error Handling**: Retry with different proxy on failure
3. **Monitoring**: Track proxy success rates
4. **Fallback**: Always have direct connection fallback
5. **Cost Optimization**: Use datacenter proxies for simple tasks, residential for complex

## Testing

Test proxy rotation:
```typescript
// Test in your API routes or server components
import { fetchWithProxy, getNextProxy } from '@/lib/proxy-rotation';

console.log('Next Proxy:', getNextProxy());
const response = await fetchWithProxy('https://api.ipify.org?format=json');
const data = await response.json();
console.log('Current IP:', data.ip);
```

## Troubleshooting

- **403 Errors**: IP may be blocked, try different proxy
- **Timeout**: Proxy may be slow, add timeout handling
- **Auth Failures**: Verify proxy credentials
- **Client-side Issues**: Use `/api/proxy-fetch` route for client-side requests

