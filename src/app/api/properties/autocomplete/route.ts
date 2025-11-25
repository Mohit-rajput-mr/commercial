import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    // Search properties by address, city, state, or zip
    const { data, error } = await supabase
      .from('properties')
      .select('id, zpid, address, city, state, zip, property_type, price, price_text, images')
      .eq('is_active', true)
      .or(`address.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,zip.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    // Format suggestions
    const suggestions = (data || []).map((prop: any) => ({
      id: prop.id,
      zpid: prop.zpid,
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zipCode: prop.zip,
      fullAddress: `${prop.address}, ${prop.city}, ${prop.state} ${prop.zip}`,
      propertyType: prop.property_type,
      price: prop.price_text || (prop.price ? `$${prop.price.toLocaleString()}` : ''),
      image: prop.images && prop.images.length > 0 ? prop.images[0] : null,
      source: 'database',
    }));

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({
      success: true,
      suggestions: [],
    });
  }
}






