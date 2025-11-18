import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route for proxy fetch
 * Handles client-side requests through rotating proxies
 */
export async function POST(request: NextRequest) {
  try {
    const { url, proxy, options } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // If proxy is provided, use it
    if (proxy) {
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

      const data = await response.text();
      
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
        },
      });
    }

    // No proxy, direct fetch
    const response = await fetch(url, options);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Proxy fetch failed' },
      { status: 500 }
    );
  }
}

