import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Detect device brand from user agent
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

// Detect device type from screen resolution
function detectDeviceTypeFromResolution(screenWidth: number | null, screenHeight: number | null): 'desktop' | 'mobile' | 'tablet' {
  if (!screenWidth || !screenHeight || screenWidth <= 0 || screenHeight <= 0) {
    return 'desktop'; // Default if no resolution
  }
  
  const aspectRatio = screenHeight / screenWidth;
  const area = screenWidth * screenHeight;
  
  // Mobile devices - small width or tall aspect ratio
  if (screenWidth < 600) {
    return 'mobile';
  }
  if (aspectRatio > 1.5 && area < 1000000) {
    return 'mobile';
  }
  if (area < 500000) {
    return 'mobile';
  }
  
  // Tablet devices
  if (screenWidth >= 600 && screenWidth < 1024 && aspectRatio <= 1.5) {
    return 'tablet';
  }
  
  // Desktop devices
  if (screenWidth >= 1024) {
    return 'desktop';
  }
  if (screenWidth >= 768 && aspectRatio < 1.2) {
    return 'desktop';
  }
  
  // Default
  if (screenWidth < 768) {
    return 'mobile';
  }
  return 'desktop';
}

export async function POST(request: NextRequest) {
  try {
    // Get all visitors that are marked as "desktop" but have small screen sizes
    const { data: desktopVisitors, error: fetchError } = await supabaseAdmin
      .from('visitors')
      .select('id, device_type, screen_width, screen_height, user_agent')
      .or('device_type.eq.desktop,device_type.is.null')
      .not('screen_width', 'is', null)
      .not('screen_height', 'is', null);

    if (fetchError) {
      console.error('Error fetching visitors:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!desktopVisitors || desktopVisitors.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No visitors to update',
      });
    }

    let updatedCount = 0;
    const updatePromises = [];

    for (const visitor of desktopVisitors) {
      const screenWidth = visitor.screen_width;
      const screenHeight = visitor.screen_height;
      
      // Check if screen size is small (mobile)
      const detectedType = detectDeviceTypeFromResolution(screenWidth, screenHeight);
      
      // Only update if detected as mobile/tablet but currently marked as desktop
      if (detectedType === 'mobile' || detectedType === 'tablet') {
        const deviceBrand = detectDeviceBrand(visitor.user_agent || '');
        let newDeviceType: string = detectedType;
        
        // Add brand for mobile/tablet devices (without "mobile" text)
        if (detectedType === 'mobile' || detectedType === 'tablet') {
          if (deviceBrand !== 'Unknown') {
            newDeviceType = deviceBrand; // Just the brand name
          } else {
            // Check user agent for iPhone/Android
            const ua = (visitor.user_agent || '').toLowerCase();
            if (ua.includes('iphone')) {
              newDeviceType = 'iPhone';
            } else if (ua.includes('android')) {
              newDeviceType = 'Android';
            } else {
              newDeviceType = detectedType; // Keep as mobile/tablet if no brand detected
            }
          }
        }
        
        // Update the visitor
        updatePromises.push(
          supabaseAdmin
            .from('visitors')
            .update({ device_type: newDeviceType })
            .eq('id', visitor.id)
        );
        updatedCount++;
      }
    }

    // Execute all updates
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Some updates failed:', errors);
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: desktopVisitors.length,
      message: `Updated ${updatedCount} visitor(s) device types`,
    });
  } catch (error) {
    console.error('Error in update-devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

