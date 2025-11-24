-- Database Optimization for Commercial Real Estate Platform
-- This file contains additional indexes and optimizations for better performance

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Properties table indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_active = true AND is_featured = true;

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_status_type ON properties(status, property_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON properties(price, status) WHERE is_active = true;

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Chats table indexes
CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_unread_admin ON chats(unread_count_admin) WHERE unread_count_admin > 0;

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_type);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_property ON favorites(user_id, property_id);

-- Inquiries table indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_property ON activities(property_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- Property views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created ON property_views(created_at);

-- =====================================================
-- MATERIALIZED VIEW FOR DASHBOARD STATS (Optional)
-- =====================================================

-- Create a materialized view for faster dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM properties WHERE is_active = true) as total_properties,
  (SELECT COUNT(*) FROM properties WHERE is_active = true AND status = 'For Lease') as for_lease,
  (SELECT COUNT(*) FROM properties WHERE is_active = true AND status = 'For Sale') as for_sale,
  (SELECT COUNT(*) FROM properties WHERE is_active = true AND status = 'Auctions') as auctions,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM chats WHERE status = 'active' AND unread_count_admin > 0) as pending_chats,
  NOW() as last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_updated ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function for optimized property search
CREATE OR REPLACE FUNCTION search_properties(
  search_term TEXT DEFAULT NULL,
  filter_city TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  filter_type TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  zpid TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  price NUMERIC,
  price_text TEXT,
  status TEXT,
  property_type TEXT,
  beds INT,
  baths NUMERIC,
  sqft INT,
  living_area INT,
  lot_size INT,
  year_built INT,
  description TEXT,
  images TEXT[],
  features TEXT[],
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  views INT,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  source TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE p.is_active = true
    AND (search_term IS NULL OR 
         p.address ILIKE '%' || search_term || '%' OR
         p.city ILIKE '%' || search_term || '%' OR
         p.state ILIKE '%' || search_term || '%' OR
         p.zip ILIKE '%' || search_term || '%')
    AND (filter_city IS NULL OR p.city ILIKE '%' || filter_city || '%')
    AND (filter_state IS NULL OR p.state ILIKE '%' || filter_state || '%')
    AND (filter_status IS NULL OR p.status = filter_status)
    AND (filter_type IS NULL OR p.property_type = filter_type)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY p.is_featured DESC, p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VACUUM AND ANALYZE FOR BETTER PERFORMANCE
-- =====================================================

-- Analyze all tables to update statistics
ANALYZE properties;
ANALYZE users;
ANALYZE chats;
ANALYZE chat_messages;
ANALYZE favorites;
ANALYZE inquiries;
ANALYZE activities;
ANALYZE property_views;
ANALYZE saved_searches;
ANALYZE site_settings;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON INDEX idx_properties_status IS 'Fast filtering by property status';
COMMENT ON INDEX idx_properties_type IS 'Fast filtering by property type';
COMMENT ON INDEX idx_properties_city IS 'Fast filtering by city';
COMMENT ON INDEX idx_properties_price IS 'Fast filtering by price range';
COMMENT ON FUNCTION search_properties IS 'Optimized property search with multiple filters';
COMMENT ON MATERIALIZED VIEW dashboard_stats IS 'Cached dashboard statistics for faster loading';



