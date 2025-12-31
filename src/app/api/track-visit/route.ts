import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeUrlServer } from '@/lib/url-normalizer';

// Get visitor IP and location info (anonymized - city/region level only)
async function getVisitorInfo(request: NextRequest) {
  // Get IP address (will be anonymized in storage)
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Get location from IP (using free service - anonymized to city level)
  let locationData = {
    country: null as string | null,
    countryCode: null as string | null,
    city: null as string | null,
    region: null as string | null,
  };

  try {
    // Using ip-api.com free tier (45 requests/minute)
    // This provides city/region level data, not exact coordinates (compliant with privacy laws)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,regionName`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      locationData = {
        country: data.country || null,
        countryCode: data.countryCode || null,
        city: data.city || null,
        region: data.regionName || null,
      };
    }
  } catch (error) {
    console.error('Error fetching location (non-critical):', error);
    // Continue without location data - not critical
  }

  return {
    ip: ip.substring(0, ip.lastIndexOf('.')) + '.xxx', // Anonymize last octet
    userAgent,
    ...locationData,
  };
}

// Detect device type from user agent
function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser from user agent
function detectBrowser(userAgent: string): string {
  const ua = userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  if (ua.includes('Brave')) return 'Brave';
  return 'Unknown';
}

// Detect OS from user agent
function detectOS(userAgent: string): string {
  const ua = userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, pageUrl, pageTitle, referrer, language, screenWidth, screenHeight } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get visitor info
    const visitorInfo = await getVisitorInfo(request);
    const deviceType = detectDevice(visitorInfo.userAgent);
    const browser = detectBrowser(visitorInfo.userAgent);
    const os = detectOS(visitorInfo.userAgent);

    // Check if this session already exists
    const { data: existingVisitor } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingVisitor) {
      // Normalize URLs before storing
      const normalizedPageUrl = pageUrl ? normalizeUrlServer(pageUrl) : existingVisitor.page_url;
      const normalizedReferrer = referrer ? normalizeUrlServer(referrer) : existingVisitor.referrer;
      
      // Update existing visitor - increment visit count
      const { error } = await supabaseAdmin
        .from('visitors')
        .update({
          last_visit_at: new Date().toISOString(),
          visit_count: (existingVisitor.visit_count || 1) + 1,
          page_url: normalizedPageUrl,
          page_title: pageTitle || existingVisitor.page_title,
          referrer: normalizedReferrer,
          session_end_at: new Date().toISOString(),
        })
        .eq('id', existingVisitor.id);

      if (error) {
        console.error('Error updating visitor:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, isNew: false });
    } else {
      // Normalize URLs before storing
      const normalizedPageUrl = normalizeUrlServer(pageUrl);
      const normalizedReferrer = referrer ? normalizeUrlServer(referrer) : null;
      
      // Create new visitor
      const { error } = await supabaseAdmin
        .from('visitors')
        .insert({
          session_id: sessionId,
          ip_address: visitorInfo.ip,
          user_agent: visitorInfo.userAgent,
          country: visitorInfo.country,
          country_code: visitorInfo.countryCode,
          city: visitorInfo.city,
          region: visitorInfo.region,
          device_type: deviceType,
          browser: browser,
          os: os,
          page_url: normalizedPageUrl,
          page_title: pageTitle,
          referrer: normalizedReferrer,
          language: language || 'en',
          screen_width: screenWidth || null,
          screen_height: screenHeight || null,
          is_new_visitor: true,
          visit_count: 1,
          session_start_at: new Date().toISOString(),
          session_end_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error tracking visitor:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, isNew: true });
    }
  } catch (error) {
    console.error('Error in track-visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for simple tracking (though POST is preferred)
export async function GET(request: NextRequest) {
  // Generate a simple session ID if not provided
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get basic info from headers
  const pageUrl = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';

  // Convert GET to POST format
  const mockBody = {
    sessionId,
    pageUrl,
    pageTitle: '',
    referrer: '',
    language: 'en',
  };

  // Create a mock request for POST handler
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockBody),
  });

  return POST(mockRequest as any);
}

