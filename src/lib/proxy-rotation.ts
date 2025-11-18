/**
 * Proxy Rotation Service for Next.js
 * Rotates requests through different IPs using serverless regions or proxy pools
 * Legal, modern, and compatible with Next.js
 */

interface ProxyConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
}

interface ProxyPool {
  proxies: ProxyConfig[];
  currentIndex: number;
}

// Example proxy pool - Replace with your actual proxy providers
// Recommended: Use services like Bright Data, Oxylabs, Smartproxy, or Rotating Residential Proxies
const proxyPool: ProxyPool = {
  proxies: [
    // Add your proxy configurations here
    // Example format:
    // { host: 'proxy1.example.com', port: 8080, protocol: 'http', auth: { username: 'user', password: 'pass' } },
    // { host: 'proxy2.example.com', port: 8080, protocol: 'http', auth: { username: 'user', password: 'pass' } },
  ],
  currentIndex: 0,
};

/**
 * Get next proxy in rotation (round-robin)
 */
export function getNextProxy(): ProxyConfig | null {
  if (proxyPool.proxies.length === 0) {
    return null; // No proxies configured, use direct connection
  }

  const proxy = proxyPool.proxies[proxyPool.currentIndex];
  proxyPool.currentIndex = (proxyPool.currentIndex + 1) % proxyPool.proxies.length;
  
  return proxy;
}

/**
 * Fetch with rotating proxy
 */
export async function fetchWithProxy(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const proxy = getNextProxy();

  if (!proxy) {
    // No proxy configured, use direct fetch
    return fetch(url, options);
  }

  // For Next.js server-side, use https-proxy-agent or http-proxy-agent
  // For client-side, you'll need a proxy endpoint or use CORS proxy services
  
  if (typeof window === 'undefined') {
    // Server-side: Use Node.js proxy agents
    return fetchWithProxyServer(url, proxy, options);
  } else {
    // Client-side: Route through Next.js API route that uses proxy
    return fetchWithProxyClient(url, proxy, options);
  }
}

/**
 * Server-side proxy fetch (Node.js)
 */
async function fetchWithProxyServer(
  url: string,
  proxy: ProxyConfig,
  options: RequestInit
): Promise<Response> {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const { HttpProxyAgent } = require('http-proxy-agent');

  const proxyUrl = `${proxy.protocol}://${
    proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}@` : ''
  }${proxy.host}:${proxy.port}`;

  const Agent = proxy.protocol === 'https' ? HttpsProxyAgent : HttpProxyAgent;
  const agent = new Agent(proxyUrl);

  const response = await fetch(url, {
    ...options,
    // @ts-ignore - agent is valid for Node.js fetch
    agent,
  });

  return response;
}

/**
 * Client-side proxy fetch (via Next.js API route)
 */
async function fetchWithProxyClient(
  url: string,
  proxy: ProxyConfig,
  options: RequestInit
): Promise<Response> {
  // Route through Next.js API route that handles proxy on server-side
  const response = await fetch('/api/proxy-fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      proxy,
      options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Proxy fetch failed: ${response.statusText}`);
  }

  return response;
}

/**
 * Alternative: Use Vercel Edge Functions or serverless regions for IP rotation
 * This uses different serverless regions which naturally have different IPs
 */
export async function fetchWithRegionRotation(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get current region or rotate regions
  const regions = ['iad1', 'sfo1', 'hnd1', 'syd1', 'fra1']; // Vercel regions
  const randomRegion = regions[Math.floor(Math.random() * regions.length)];

  // In Vercel, you can deploy edge functions in different regions
  // This naturally rotates IPs based on serverless region
  
  // For Next.js API routes, you can specify regions in vercel.json
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-vercel-region': randomRegion, // Example header
    },
  });

  return response;
}

/**
 * Alternative: Use Cloudflare Workers or similar for IP rotation
 */
export async function fetchWithCloudflareRotation(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Cloudflare Workers automatically rotate through different IPs
  // Deploy your fetch endpoint as a Cloudflare Worker
  
  const cloudflareWorkerUrl = process.env.CLOUDFLARE_WORKER_URL || '';
  
  if (!cloudflareWorkerUrl) {
    return fetch(url, options);
  }

  return fetch(cloudflareWorkerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      options,
    }),
  });
}

/**
 * Simple IP rotation using different fetch endpoints
 * Each endpoint can be deployed in different regions/servers
 */
export function rotateFetchEndpoint(url: string): string {
  const endpoints = [
    process.env.API_ENDPOINT_1,
    process.env.API_ENDPOINT_2,
    process.env.API_ENDPOINT_3,
  ].filter(Boolean);

  if (endpoints.length === 0) {
    return url; // No rotation configured
  }

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  return `${randomEndpoint}${url}`;
}


