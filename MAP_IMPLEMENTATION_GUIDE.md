# Split-Screen Map Implementation Guide

## Overview
The `/unified-search` page has been successfully upgraded with a split-screen layout featuring an interactive Geoapify map on the left and a scrollable property list on the right.

## 🎯 Key Features Implemented

### 1. **Split-Screen Layout (50/50)**
- **Desktop**: Map on left (50%), property list on right (50%)
- **Mobile**: Toggle between Map View and List View tabs
- Map is sticky on desktop for better UX while scrolling properties

### 2. **Interactive Geoapify Map**
- **Map Library**: Leaflet.js with Geoapify tiles
- **API Key**: `f396d0928e4b41eeac1751e01b3a444e` (hardcoded)
- **Default Tile**: Carto style (street view)
- **Features**:
  - Marker clustering for multiple properties
  - Custom markers (blue for residential, orange for commercial)
  - Property popups with image, address, and price
  - Auto-fit bounds to show all properties

### 3. **Map Controls**
- **Style Toggle**: Switch between 4 map styles
  - Carto (Street View)
  - OSM Bright
  - Dark Matter
  - Klokantech Basic
- **Draw Boundary**: Draw rectangular search area on map
- **Remove Boundary**: Clear drawn boundary
- **Zoom Controls**: Standard Leaflet zoom +/- buttons

### 4. **Geocoding Integration**
- **Service**: Geoapify Geocoding API
- **Caching**: Addresses are cached to minimize API calls
- **Batch Processing**: Properties geocoded in batches of 5 with rate limiting
- **Fallback**: Uses existing lat/lng from property data when available

### 5. **Map-List Synchronization**
- **Hover Property Card** → Highlights and pulses corresponding map marker + opens popup
- **Hover Map Marker** → Highlights corresponding property card in list
- **Click Map Marker** → Navigates to property details page + scrolls to card in list
- **Click Property Card** → Navigates to property details page

### 6. **Responsive Design**
- **Desktop (≥768px)**: Split-screen with sticky map
- **Mobile (<768px)**: Toggle tabs (Map View / List View)
- **Property Cards**: Single column layout in right panel for better readability

## 📁 Files Created/Modified

### New Files:
1. **`src/lib/geocoding.ts`**
   - Geocoding utilities using Geoapify API
   - Address caching mechanism
   - Batch geocoding support
   - Bounds calculation helper

2. **`src/components/MapView.tsx`**
   - Main map component with Leaflet integration
   - Marker clustering
   - Map style switching
   - Draw boundary functionality
   - Marker interactions and popups

### Modified Files:
1. **`src/app/unified-search/page.tsx`**
   - Added split-screen layout
   - Integrated MapView component
   - Added hover/click synchronization
   - Mobile view toggle functionality
   - Property refs for scroll-to-card feature

2. **`package.json`**
   - Added dependencies:
     - `leaflet`
     - `leaflet.markercluster`
     - `@types/leaflet`
     - `@types/leaflet.markercluster`

## 🚀 Usage

### Testing the Implementation:
1. Navigate to: `http://localhost:3001/unified-search?location=Miami,%20FL`
2. The page will display:
   - Left: Interactive map with property markers
   - Right: Scrollable list of properties

### Map Interactions:
- **Click marker**: View property details
- **Hover marker**: Highlight property in list
- **Change style**: Click the style toggle button (top-right)
- **Draw boundary**: Click "Draw Boundary" and drag on map
- **Remove boundary**: Click "Remove Boundary" button

### List Interactions:
- **Hover card**: Marker pulses and popup opens
- **Click card**: Navigate to property details
- **Scroll**: Map stays visible (desktop)

### Mobile:
- Use "Map" and "List" tabs to switch views
- Full-screen map or list view

## 🎨 Map Styles Available

```javascript
// Change tile URL to switch styles:
'carto': 'https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=...'
'osm-bright': 'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?&apiKey=...'
'dark-matter': 'https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?&apiKey=...'
'klokantech-basic': 'https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?&apiKey=...'
```

## 🔑 API Configuration

### Geoapify API Key:
```javascript
const GEOAPIFY_API_KEY = 'f396d0928e4b41eeac1751e01b3a444e';
```

### API Endpoints Used:
1. **Map Tiles**: `https://maps.geoapify.com/v1/tile/{style}/{z}/{x}/{y}.png?&apiKey={key}`
2. **Geocoding**: `https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={key}`

### Rate Limits:
- Free tier: 3,000 requests/day
- Caching implemented to minimize API calls

## 🔧 Technical Details

### Geocoding Strategy:
1. Check if property has existing lat/lng coordinates
2. If not, construct full address string
3. Check cache for previously geocoded address
4. Make API call if not cached
5. Cache result for future use

### Marker Clustering:
- Uses `leaflet.markercluster` plugin
- Automatically groups nearby markers
- Spiderfies on max zoom
- Click cluster to zoom in

### Performance Optimizations:
- Lazy loading of Leaflet library (client-side only)
- Address caching to reduce API calls
- Batch geocoding with delays to respect rate limits
- Marker clustering to handle large datasets

## 🐛 Troubleshooting

### Map not loading:
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Ensure API key is valid

### Markers not appearing:
- Check if properties have valid addresses
- Look for geocoding errors in console
- Verify API rate limits not exceeded

### Sync not working:
- Ensure property IDs (zpid) are unique
- Check hover event handlers in console
- Verify propertyRefs are properly set

## 📊 Data Flow

```
User searches location
    ↓
Properties fetched (residential + commercial)
    ↓
Properties passed to MapView component
    ↓
Addresses geocoded to lat/lng
    ↓
Markers added to map with clustering
    ↓
User interactions (hover/click)
    ↓
Events synchronized between map and list
```

## 🎯 Future Enhancements

Potential improvements:
1. Filter properties by map bounds (toggle option)
2. Advanced drawing tools (polygon, circle)
3. Save custom search boundaries
4. Heat map view for property density
5. Street view integration
6. Property comparison mode
7. Export visible properties to CSV
8. Share map view with URL parameters

## 📝 Notes

- The implementation uses the free tier of Geoapify API
- All API keys are hardcoded (consider environment variables for production)
- Map state is not persisted across page refreshes
- Geocoding results are cached in memory (not localStorage)
- Mobile view uses CSS-based responsive design (no separate mobile component)

## ✅ Completed Features Checklist

- [x] Split-screen layout (50/50)
- [x] Geoapify map integration with Leaflet.js
- [x] Property markers with custom icons
- [x] Marker clustering
- [x] Geocoding with caching
- [x] Map style toggle (4 styles)
- [x] Draw boundary tool
- [x] Remove boundary button
- [x] Marker popups with property info
- [x] Click marker → view details
- [x] Hover card → highlight marker
- [x] Hover marker → highlight card
- [x] Responsive mobile view (toggle tabs)
- [x] Auto-fit bounds to properties
- [x] Property count badge
- [x] Loading states
- [x] Error handling

---

**Implementation Date**: November 25, 2025
**Status**: ✅ Complete and Ready for Testing



