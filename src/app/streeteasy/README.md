# StreetEasy Property Search

A comprehensive property search interface for NYC and New Jersey properties using the StreetEasy API from RapidAPI.

## Features

### Search Page (`/streeteasy`)

#### Property Status Tabs
- **Active Sales**: Search current properties for sale
- **Past Sales**: View historical sales data
- **Active Rentals**: Find available rental properties
- **Past Rentals**: Browse past rental listings

#### Search Filters
- **Address & Neighborhood Autocomplete**: 
  - Real-time autocomplete powered by StreetEasy API
  - Search by full addresses, neighborhoods, or areas
  - Displays suggestions with location type and descriptions
  - Debounced search (300ms) for optimal performance
  - Fallback to common neighborhoods if API is unavailable
  - Visual indicators for loading state
  - Supports multiple location selections

- **Price Range**: Min and max price filters
- **Bedrooms**: Min and max bedroom count (0-10)
- **Bathrooms**: Min bathroom count (0-5)
- **Property Types**: Condo, Coop, House
- **Amenities**: 
  - Washer/Dryer
  - Dishwasher
  - Private Outdoor Space
  - Laundry
  - Elevator
  - Doorman
  - Gym
  - Pets Allowed
  - Roof Deck

#### Sales-Specific Filters
- Max Monthly HOA
- Max Monthly Tax

#### Rentals-Specific Filters
- No Fee Only checkbox

#### Display Options
- Results per page: 20, 50, 100, 200, 500
- Sort by: Newest, Price Low to High, Price High to Low

#### Results Display
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Property cards with:
  - High-quality images (fetched from detail endpoint)
  - Price overlay
  - Address
  - Bedrooms and bathrooms
  - Square footage
  - Property type
  - Status badge
  - View Details button
- Pagination controls
- Results counter

#### Additional Features
- **Save Search**: Store search criteria in localStorage
- **Export to CSV**: Download results as CSV file
- **Map View Toggle**: Switch between list and map view
- **Clear Filters**: Reset all search parameters

### Property Detail Page (`/streeteasy/property/[id]`)

#### Image Gallery
- Full-screen image viewer
- Navigation arrows for multiple images
- Thumbnail gallery
- Image counter
- Smooth loading transitions

#### Property Information
- Price and address
- Neighborhood
- Key stats (beds, baths, sqft, type)
- Price per square foot
- Year built
- Days on market
- Monthly HOA and tax costs
- Lot size
- Parking information
- Pet policy
- Heating/cooling systems
- Laundry facilities
- Number of floors
- Unit count in building

#### Additional Sections
- Full property description
- Amenities list with checkmarks
- Additional features grid
- Sale history (if available)
- Interactive map with coordinates
- Google Maps integration

#### Agent Contact Card
- Agent name
- Phone number (clickable)
- Email address (clickable)
- Request Information button
- Schedule Viewing button

## API Configuration

**Base URL**: `https://streeteasy-api.p.rapidapi.com`

**Headers**:
- `x-rapidapi-key`: 5037acc84cmshe961f4b77fc7a19p1f9f6djsn90114065adc7
- `x-rapidapi-host`: streeteasy-api.p.rapidapi.com

## API Endpoints Used

### Autocomplete Endpoint
- `GET /autocomplete?query={query}` - Real-time address and neighborhood suggestions

### Search Endpoints
- `GET /sales/search` - Active sales listings
- `GET /sales/past/search` - Past sales listings
- `GET /rentals/search` - Active rental listings
- `GET /rentals/past/search` - Past rental listings

### Detail Endpoints
- `GET /sales/{id}` - Full details for a sale listing
- `GET /rentals/{id}` - Full details for a rental listing

## Technical Implementation

### State Management
- React `useState` for form inputs and results
- `useEffect` for data fetching
- Debounced neighborhood search (300ms)
- Client-side sorting and filtering

### Image Loading Strategy
1. Search returns basic property info (id, price, coordinates)
2. Parallel API calls fetch full details for all visible properties
3. Images extracted from detail responses
4. Skeleton loaders during image loading
5. Fallback to placeholder for missing images

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages
- Validation for required fields (neighborhoods)
- Graceful fallbacks for missing data

### Performance Optimizations
- Parallel property detail fetching with `Promise.all`
- Image lazy loading with Next.js Image component
- Debounced autocomplete search
- Pagination for large result sets
- Cached property details in state

### Responsive Design
- Mobile-first approach
- Tailwind CSS utility classes
- Responsive grid layouts
- Touch-friendly controls
- Optimized for all screen sizes

## Usage

1. Navigate to `/streeteasy`
2. Select property status (Active Sales, Past Sales, Active Rentals, Past Rentals)
3. Search and select one or more neighborhoods
4. Apply desired filters (price, beds, baths, amenities, etc.)
5. Click "Search Properties"
6. Browse results and click "View Details" for more information
7. On detail page, view full property information and contact agent

## Features Not Yet Implemented

- Interactive map view with property markers
- Real-time chat with agents
- Saved searches management dashboard
- Property comparison tool
- Email alerts for new listings
- Virtual tour integration

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (icons)

