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

// Detect device brand/model from user agent
function detectDeviceBrand(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  // iPhone detection
  if (ua.includes('iphone')) {
    return 'iPhone';
  }
  
  // Samsung detection
  if (ua.includes('samsung') || ua.includes('sm-') || ua.includes('galaxy')) {
    return 'Samsung';
  }
  
  // Realme detection
  if (ua.includes('realme') || ua.includes('rmx')) {
    return 'Realme';
  }
  
  // Redmi/Xiaomi detection
  if (ua.includes('redmi') || ua.includes('mi ') || ua.includes('xiaomi') || ua.includes('mi-')) {
    return 'Redmi';
  }
  
  // Android (generic)
  if (ua.includes('android')) {
    return 'Android';
  }
  
  return 'Unknown';
}

// Detect device type from user agent and screen resolution
function detectDevice(userAgent: string, screenWidth?: number | null, screenHeight?: number | null): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  // Use screen resolution as PRIMARY indicator if available
  if (screenWidth && screenHeight && screenWidth > 0 && screenHeight > 0) {
    const aspectRatio = screenHeight / screenWidth;
    const area = screenWidth * screenHeight;
    
    // Mobile devices - check first (most restrictive)
    // - Small width (< 600px) is almost always mobile
    // - OR tall aspect ratio (> 1.3) with small area
    // - OR very small screens (area < 500,000)
    if (screenWidth < 600) {
      return 'mobile'; // Small width = mobile
    }
    if (aspectRatio > 1.5 && area < 1000000) {
      return 'mobile'; // Tall and small = mobile
    }
    if (area < 500000) {
      return 'mobile'; // Very small area = mobile
    }
    
    // Tablet devices
    // - Medium width (600-1024px) with reasonable aspect ratio
    if (screenWidth >= 600 && screenWidth < 1024 && aspectRatio <= 1.5) {
      return 'tablet';
    }
    
    // Desktop/laptop devices
    // - Large width (>= 1024px) OR
    // - Medium-large width (>= 768px) with landscape orientation
    if (screenWidth >= 1024) {
      return 'desktop';
    }
    if (screenWidth >= 768 && aspectRatio < 1.2) {
      return 'desktop';
    }
    
    // Edge cases - default based on size
    if (screenWidth < 768) {
      return 'mobile'; // Default small screens to mobile
    }
    return 'desktop'; // Default larger screens to desktop
  }
  
  // Fallback to user agent detection if resolution not available
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
    const deviceType = detectDevice(visitorInfo.userAgent, screenWidth, screenHeight);
    const deviceBrand = detectDeviceBrand(visitorInfo.userAgent);
    const browser = detectBrowser(visitorInfo.userAgent);
    const os = detectOS(visitorInfo.userAgent);
    
    // Combine device type with brand for better identification
    // Priority: Resolution > User Agent for device type, User Agent for brand
    let deviceInfo: string = deviceType;
    
    // If we have resolution, trust it for device type
    // But always check user agent for brand information
    if (screenWidth && screenHeight) {
      // Resolution-based detection is primary
      if (deviceType === 'mobile' || deviceType === 'tablet') {
        // Add brand for mobile/tablet devices (without "mobile" text)
        if (deviceBrand !== 'Unknown') {
          deviceInfo = deviceBrand; // Just the brand name
        } else {
          // Fallback brand detection from user agent
          const ua = visitorInfo.userAgent.toLowerCase();
          if (ua.includes('iphone')) {
            deviceInfo = 'iPhone';
          } else if (ua.includes('ipad')) {
            deviceInfo = 'iPad';
          } else if (ua.includes('android')) {
            deviceInfo = 'Android';
          } else {
            deviceInfo = deviceType; // Keep as mobile/tablet if no brand detected
          }
        }
      }
      // Desktop stays as "desktop" (no brand)
    } else {
      // No resolution - use user agent for both type and brand
      if (deviceType === 'mobile' || deviceType === 'tablet') {
        if (deviceBrand !== 'Unknown') {
          deviceInfo = deviceBrand; // Just the brand name
        } else {
          const ua = visitorInfo.userAgent.toLowerCase();
          if (ua.includes('iphone')) {
            deviceInfo = 'iPhone';
          } else if (ua.includes('ipad')) {
            deviceInfo = 'iPad';
          } else if (ua.includes('android')) {
            deviceInfo = 'Android';
          } else {
            deviceInfo = deviceType; // Keep as mobile/tablet if no brand detected
          }
        }
      }
    }
    
    // Final safety check: if resolution says desktop but user agent clearly says mobile, override
    // This handles cases where resolution might be wrong (e.g., browser in desktop mode on mobile)
    if (deviceType === 'desktop') {
      const ua = visitorInfo.userAgent.toLowerCase();
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        // User agent says mobile - trust it over resolution
        const mobileBrand = detectDeviceBrand(visitorInfo.userAgent);
        if (mobileBrand !== 'Unknown') {
          deviceInfo = mobileBrand; // Just the brand name
        } else if (ua.includes('iphone')) {
          deviceInfo = 'iPhone';
        } else if (ua.includes('android')) {
          deviceInfo = 'Android';
        } else {
          deviceInfo = 'mobile';
        }
      }
    }

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
      
      // Re-evaluate device type if we have screen resolution
      // This fixes cases where device was incorrectly identified before
      let finalDeviceInfo = deviceInfo;
      if (screenWidth && screenHeight) {
        // We have resolution, so use our detection
        finalDeviceInfo = deviceInfo;
      } else if (existingVisitor.screen_width && existingVisitor.screen_height) {
        // Use existing resolution to re-detect if current detection seems wrong
        const reDetectedType = detectDevice(visitorInfo.userAgent, existingVisitor.screen_width, existingVisitor.screen_height);
        const reDetectedBrand = detectDeviceBrand(visitorInfo.userAgent);
        
        if (reDetectedType === 'mobile' || reDetectedType === 'tablet') {
          if (reDetectedBrand !== 'Unknown') {
            finalDeviceInfo = reDetectedBrand; // Just the brand name
          } else {
            const ua = visitorInfo.userAgent.toLowerCase();
            if (ua.includes('iphone')) {
              finalDeviceInfo = 'iPhone';
            } else if (ua.includes('android')) {
              finalDeviceInfo = 'Android';
            } else {
              finalDeviceInfo = reDetectedType;
            }
          }
        } else {
          finalDeviceInfo = reDetectedType;
        }
      }
      
      // Update existing visitor - increment visit count and update device info
      const { error } = await supabaseAdmin
        .from('visitors')
        .update({
          last_visit_at: new Date().toISOString(),
          visit_count: (existingVisitor.visit_count || 1) + 1,
          page_url: normalizedPageUrl,
          page_title: pageTitle || existingVisitor.page_title,
          referrer: normalizedReferrer,
          session_end_at: new Date().toISOString(),
          device_type: finalDeviceInfo, // Use re-evaluated device info
          screen_width: screenWidth || existingVisitor.screen_width,
          screen_height: screenHeight || existingVisitor.screen_height,
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
          device_type: deviceInfo,
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

