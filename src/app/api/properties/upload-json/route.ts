import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    if (!Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Properties must be an array' },
        { status: 400 }
      );
    }

    // Transform and validate properties
    const transformedProperties = properties.map((prop: any) => ({
      zpid: prop.zpid || prop.propertyId || `prop-${Date.now()}-${Math.random()}`,
      address: prop.address || 'Address not available',
      city: prop.city || '',
      state: prop.state || '',
      zip: prop.zip || '',
      country: prop.country || 'USA',
      price: prop.priceNumeric || prop.price || null,
      price_text: prop.price || null,
      status: prop.listingType?.includes('lease') ? 'For Lease' : 
              prop.listingType?.includes('sale') ? 'For Sale' :
              prop.isAuction ? 'Auctions' : 'For Sale',
      property_type: prop.propertyTypeDetailed || prop.propertyType || 'Other',
      beds: prop.bedrooms || null,
      baths: prop.bathrooms || null,
      sqft: prop.squareFootage || prop.livingArea || null,
      living_area: prop.livingArea || prop.squareFootage || null,
      lot_size: prop.lotSize || null,
      year_built: prop.yearBuilt || null,
      description: prop.description || null,
      features: prop.features || [],
      images: prop.images || [],
      virtual_tour_url: prop.virtualTourUrl || null,
      latitude: prop.latitude || null,
      longitude: prop.longitude || null,
      contact_name: 'Leo Jo',
      contact_email: 'leojoemail@gmail.com',
      contact_phone: '+1 (917) 209-6200',
      views: 0,
      inquiries: 0,
      is_featured: false,
      is_active: true,
      listing_url: prop.listingUrl || null,
      source: 'json_upload',
      created_by: user.id,
    }));

    // Insert properties in batches
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < transformedProperties.length; i += batchSize) {
      const batch = transformedProperties.slice(i, i + batchSize);
      
      const { data, error } = await supabaseAdmin
        .from('properties')
        .upsert(batch, { onConflict: 'zpid' })
        .select();

      if (error) {
        console.error('Error inserting batch:', error);
        continue;
      }

      results.push(...(data || []));
    }

    // Log activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      activity_type: 'property_added',
      description: `Bulk upload: ${results.length} properties added from JSON`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${results.length} properties`,
      count: results.length,
    });
  } catch (error) {
    console.error('JSON upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



