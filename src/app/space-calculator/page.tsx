'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  X,
  Calculator,
  CheckCircle,
  AlertCircle,
  Layout,
  DollarSign,
  Zap,
  Building2,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Types
interface Room {
  id: string;
  type: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  quantity: number;
  isRequired: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  propertyType: string;
  sqftPerPerson: number;
  rooms: {[key: string]: { enabled: boolean; quantity: number }};
}

// Property type to building shape mapping - ALL RECTANGLES
const PROPERTY_TYPE_SHAPES: {[key: string]: 'square' | 'rectangle' | 'l-shape' | 'u-shape' | 't-shape' | 'h-shape' | 'courtyard' | 'plus-shape' | 'z-shape'} = {
  'Office': 'rectangle',
  'Retail': 'rectangle',
  'Restaurant': 'rectangle',
  'Warehouse': 'rectangle',
  'Medical': 'rectangle',
  'Industrial': 'rectangle',
};

// Room type definitions with default sizes, colors, and cost factors
const ROOM_TYPES = {
  'private-office': { 
    name: 'Private Office', 
    defaultSize: 120, 
    color: '#3B82F6', 
    minSize: 80,
    costPerSqft: 180, // Higher cost for private offices (walls, doors, finishes)
  },
  'open-workspace': { 
    name: 'Open Workspace', 
    defaultSize: 400, 
    color: '#10B981', 
    minSize: 200,
    costPerSqft: 120, // Lower cost (open space, minimal walls)
  },
  'conference-room': { 
    name: 'Conference Room', 
    defaultSize: 200, 
    color: '#8B5CF6', 
    minSize: 150,
    costPerSqft: 200, // Higher cost (AV equipment, soundproofing, premium finishes)
  },
  'meeting-room': { 
    name: 'Meeting Room', 
    defaultSize: 120, 
    color: '#EC4899', 
    minSize: 80,
    costPerSqft: 170, // Moderate-high cost (walls, AV, finishes)
  },
  'kitchen': { 
    name: 'Kitchen', 
    defaultSize: 150, 
    color: '#F59E0B', 
    minSize: 100,
    costPerSqft: 250, // High cost (plumbing, appliances, ventilation, finishes)
  },
  'break-room': { 
    name: 'Break Room', 
    defaultSize: 120, 
    color: '#F97316', 
    minSize: 80,
    costPerSqft: 180, // Moderate-high cost (appliances, finishes)
  },
  'reception': { 
    name: 'Reception', 
    defaultSize: 150, 
    color: '#06B6D4', 
    minSize: 100,
    costPerSqft: 220, // High cost (premium finishes, furniture, branding)
  },
  'restroom': { 
    name: 'Restroom', 
    defaultSize: 80, 
    color: '#6366F1', 
    minSize: 50,
    costPerSqft: 280, // Very high cost (plumbing, fixtures, ventilation, waterproofing)
  },
  'storage': { 
    name: 'Storage', 
    defaultSize: 100, 
    color: '#78716C', 
    minSize: 50,
    costPerSqft: 100, // Low cost (basic finishes, shelving)
  },
  'server-room': { 
    name: 'Server Room', 
    defaultSize: 100, 
    color: '#DC2626', 
    minSize: 60,
    costPerSqft: 350, // Very high cost (HVAC, power, security, fire suppression)
  },
  'copy-room': { 
    name: 'Copy Room', 
    defaultSize: 80, 
    color: '#14B8A6', 
    minSize: 50,
    costPerSqft: 130, // Moderate cost (basic finishes, equipment)
  },
};

// Helper function to get building shape name for display
const getBuildingShapeName = (shape: string): string => {
  const names: {[key: string]: string} = {
    'square': 'Square',
    'rectangle': 'Rectangle',
    'l-shape': 'L-Shape',
    'u-shape': 'U-Shape',
    't-shape': 'T-Shape',
    'h-shape': 'H-Shape',
    'courtyard': 'Courtyard',
    'plus-shape': 'Plus Shape',
    'z-shape': 'Z-Shape',
  };
  return names[shape] || 'Rectangle';
};

// Templates
const TEMPLATES: Template[] = [
  {
    id: 'traditional-office',
    name: 'Traditional Office',
    description: 'Classic layout with private offices',
    propertyType: 'Office',
    sqftPerPerson: 150,
    rooms: {
      'reception': { enabled: true, quantity: 1 },
      'private-office': { enabled: true, quantity: 5 },
      'conference-room': { enabled: true, quantity: 2 },
      'kitchen': { enabled: true, quantity: 1 },
      'restroom': { enabled: true, quantity: 2 },
      'storage': { enabled: false, quantity: 1 },
    },
  },
  {
    id: 'modern-open-office',
    name: 'Modern Open Office',
    description: 'Open workspace with collaboration zones',
    propertyType: 'Office',
    sqftPerPerson: 120,
    rooms: {
      'reception': { enabled: true, quantity: 1 },
      'open-workspace': { enabled: true, quantity: 1 },
      'meeting-room': { enabled: true, quantity: 3 },
      'conference-room': { enabled: true, quantity: 1 },
      'kitchen': { enabled: true, quantity: 1 },
      'break-room': { enabled: false, quantity: 1 },
      'restroom': { enabled: true, quantity: 2 },
    },
  },
  {
    id: 'retail-store',
    name: 'Retail Store',
    description: 'Customer-focused retail space',
    propertyType: 'Retail',
    sqftPerPerson: 200,
    rooms: {
      'reception': { enabled: true, quantity: 1 },
      'open-workspace': { enabled: true, quantity: 1 },
      'storage': { enabled: true, quantity: 2 },
      'restroom': { enabled: true, quantity: 1 },
      'private-office': { enabled: false, quantity: 1 },
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining and kitchen layout',
    propertyType: 'Restaurant',
    sqftPerPerson: 180,
    rooms: {
      'reception': { enabled: true, quantity: 1 },
      'open-workspace': { enabled: true, quantity: 1 },
      'kitchen': { enabled: true, quantity: 1 },
      'storage': { enabled: true, quantity: 2 },
      'restroom': { enabled: true, quantity: 2 },
      'private-office': { enabled: false, quantity: 1 },
    },
  },
];

// Helper function to format cost as currency
const formatCost = (cost: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cost);
};

export default function SpaceCalculatorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Form state
  const [propertyType, setPropertyType] = useState('Office');
  const [employees, setEmployees] = useState(25);
  const [sqftPerPerson, setSqftPerPerson] = useState(150);
  
  // Automatically determine building shape based on property type
  const buildingShape = PROPERTY_TYPE_SHAPES[propertyType] || 'rectangle';
  
  // Room selections
  const [selectedRooms, setSelectedRooms] = useState<{[key: string]: { enabled: boolean; quantity: number; customSize?: number }}>({
    'reception': { enabled: true, quantity: 1 },
    'private-office': { enabled: true, quantity: 5 },
    'open-workspace': { enabled: true, quantity: 1 },
    'conference-room': { enabled: true, quantity: 2 },
    'meeting-room': { enabled: false, quantity: 1 },
    'kitchen': { enabled: true, quantity: 1 },
    'break-room': { enabled: false, quantity: 1 },
    'restroom': { enabled: true, quantity: 2 },
    'storage': { enabled: false, quantity: 1 },
    'server-room': { enabled: false, quantity: 1 },
    'copy-room': { enabled: false, quantity: 1 },
  });
  
  // Modal state
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [placedRooms, setPlacedRooms] = useState<Room[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  
  // Calculate total square footage
  const totalSqft = employees * sqftPerPerson;
  
  const loadTemplate = (template: Template) => {
    setPropertyType(template.propertyType);
    setSqftPerPerson(template.sqftPerPerson);
    setSelectedRooms(template.rooms);
  };
  
  const generateFloorPlan = () => {
    setIsGenerating(true);
    
    // Simulate generation delay for UX
    setTimeout(() => {
      const rooms: Room[] = [];
      let roomId = 0;
      
      // Count total rooms to place
      const totalRoomsToPlace = Object.entries(selectedRooms)
        .filter(([_, config]) => config.enabled && config.quantity > 0)
        .reduce((sum, [_, config]) => sum + config.quantity, 0);
      
      // Calculate building dimensions with adaptive sizing based on room count
      // More rooms = larger building to accommodate them
      const totalArea = totalSqft;
      const roomCountFactor = Math.max(1.0, Math.sqrt(totalRoomsToPlace / 5)); // Scale up for many rooms
      let buildingWidth = 0;
      let buildingHeight = 0;
      
      switch (buildingShape) {
        case 'square':
          buildingWidth = buildingHeight = Math.sqrt(totalArea * roomCountFactor);
          break;
        case 'rectangle':
          buildingWidth = Math.sqrt(totalArea * 1.5 * roomCountFactor);
          buildingHeight = totalArea / buildingWidth;
          break;
        case 'l-shape':
          buildingWidth = Math.sqrt(totalArea * 1.3 * roomCountFactor);
          buildingHeight = buildingWidth;
          break;
        case 'u-shape':
          buildingWidth = Math.sqrt(totalArea * 1.4 * roomCountFactor);
          buildingHeight = buildingWidth * 0.8;
          break;
        case 't-shape':
          buildingWidth = Math.sqrt(totalArea * 1.4 * roomCountFactor);
          buildingHeight = buildingWidth * 0.9;
          break;
        case 'h-shape':
          buildingWidth = Math.sqrt(totalArea * 1.5 * roomCountFactor);
          buildingHeight = buildingWidth * 0.85;
          break;
        case 'courtyard':
          buildingWidth = buildingHeight = Math.sqrt(totalArea * 1.25 * roomCountFactor);
          break;
        case 'plus-shape':
          buildingWidth = buildingHeight = Math.sqrt(totalArea * 1.3 * roomCountFactor);
          break;
        case 'z-shape':
          buildingWidth = Math.sqrt(totalArea * 1.45 * roomCountFactor);
          buildingHeight = buildingWidth * 0.75;
          break;
      }
      
      // Calculate circulation space (12% of total for corridors/hallways)
      const circulationSpace = totalArea * 0.12;
      const usableSpace = totalArea - circulationSpace;
      
      // Collect ALL rooms to place - ensure every checked room with quantity is included
      const roomsToPlace: { type: string; size: number; index: number; originalSize: number }[] = [];
      Object.entries(selectedRooms).forEach(([type, config]) => {
        if (config.enabled && config.quantity > 0) {
          const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
          const baseSize = config.customSize || roomType.defaultSize;
          
          // Add ALL rooms with their quantities - slight variation for realism
          for (let i = 0; i < config.quantity; i++) {
            const variation = 1 + (Math.random() - 0.5) * 0.15; // ±7.5% variation for realism
            const variedSize = Math.max(roomType.minSize, baseSize * variation);
            roomsToPlace.push({ 
              type, 
              size: variedSize, 
              index: i,
              originalSize: baseSize 
            });
          }
        }
      });
      
      // Calculate total requested space
      const totalRequestedSpace = roomsToPlace.reduce((sum, r) => sum + r.size, 0);
      
      // AGGRESSIVE SCALING: Scale down ALL rooms to ensure they ALL fit
      // Calculate scale factor to fit all rooms with 10% margin for circulation
      let scaleFactor = (usableSpace * 0.9) / totalRequestedSpace;
      
      // If rooms don't fit, scale down more aggressively
      if (scaleFactor < 1.0) {
        // Scale down to fit - use 85% of usable space to ensure all rooms fit
        scaleFactor = (usableSpace * 0.85) / totalRequestedSpace;
        console.log(`📐 Scaling all rooms down by ${((1 - scaleFactor) * 100).toFixed(1)}% to fit all ${roomsToPlace.length} rooms`);
      } else {
        // Rooms fit, but scale slightly to leave circulation space
        scaleFactor = Math.min(scaleFactor, 0.95);
      }
      
      // Ensure scale factor is reasonable but allow aggressive scaling to fit all rooms
      scaleFactor = Math.max(0.2, Math.min(1.0, scaleFactor));
      
      // SIMPLE RECTANGLE VALIDATION - All floorplans are now rectangles
      const isValidPosition = (x: number, y: number, w: number, h: number): boolean => {
        const margin = 5;
        // Simple rectangle check - room must be fully inside
        return x >= margin && y >= margin && 
               x + w <= buildingWidth - margin && 
               y + h <= buildingHeight - margin;
      };
      
      // Check for collisions with existing rooms
      const checkCollision = (x: number, y: number, w: number, h: number, excludeId?: string): boolean => {
        const padding = 2; // Minimum gap between rooms (reduced for better packing)
        for (const room of rooms) {
          if (excludeId && room.id === excludeId) continue;
          if (x < room.x + room.width + padding && x + w + padding > room.x &&
              y < room.y + room.height + padding && y + h + padding > room.y) {
            return true;
          }
        }
        return false;
      };
      
      // Simple validation for rectangles
      const isRoomFullyInside = (x: number, y: number, w: number, h: number): boolean => {
        return isValidPosition(x, y, w, h);
      };
      
      // Get preferred location for room type (clustering logic)
      const getPreferredLocation = (type: string, existingRooms: Room[]): { preferredZone: string; preferredX?: number; preferredY?: number } => {
        const margin = 5;
        const entranceX = buildingWidth / 2;
        const entranceY = margin + 10;
        
        switch (type) {
          case 'reception':
            // Near main entrance (center front)
            return { preferredZone: 'entrance', preferredX: entranceX - 20, preferredY: entranceY };
          
          case 'private-office':
            // Along perimeter (prefer outer walls for windows)
            return { preferredZone: 'perimeter' };
          
          case 'open-workspace':
            // Central zone
            return { preferredZone: 'central', preferredX: buildingWidth / 2, preferredY: buildingHeight / 2 };
          
          case 'conference-room':
          case 'meeting-room':
            // Accessible but not central - near entrance or perimeter
            return { preferredZone: 'accessible' };
          
          case 'restroom':
            // Cluster restrooms together, interior location
            const existingRestrooms = existingRooms.filter(r => r.type === 'restroom');
            if (existingRestrooms.length > 0) {
              const avgX = existingRestrooms.reduce((sum, r) => sum + r.x + r.width/2, 0) / existingRestrooms.length;
              const avgY = existingRestrooms.reduce((sum, r) => sum + r.y + r.height/2, 0) / existingRestrooms.length;
              return { preferredZone: 'cluster', preferredX: avgX, preferredY: avgY };
            }
            return { preferredZone: 'interior' };
          
          case 'kitchen':
          case 'break-room':
            // Interior, away from restrooms
            const restroomLocations = existingRooms.filter(r => r.type === 'restroom').map(r => ({ x: r.x + r.width/2, y: r.y + r.height/2 }));
            if (restroomLocations.length > 0) {
              // Place away from restrooms
              const avgRestroomX = restroomLocations.reduce((sum, r) => sum + r.x, 0) / restroomLocations.length;
              const preferredX = avgRestroomX > buildingWidth / 2 ? buildingWidth * 0.25 : buildingWidth * 0.75;
              return { preferredZone: 'interior', preferredX, preferredY: buildingHeight * 0.4 };
            }
            return { preferredZone: 'interior' };
          
          case 'storage':
          case 'copy-room':
            // Less prime locations, can be interior
            return { preferredZone: 'interior' };
          
          case 'server-room':
            // Interior, secure location (away from perimeter)
            return { preferredZone: 'interior', preferredX: buildingWidth * 0.5, preferredY: buildingHeight * 0.5 };
          
          default:
            return { preferredZone: 'any' };
        }
      };
      
      // SIMPLE GRID-BASED POSITION GENERATION for rectangles
      const generateCandidatePositions = (width: number, height: number): Array<{x: number; y: number}> => {
        const candidates: Array<{x: number; y: number}> = [];
        const margin = 5;
        const gridStep = Math.max(3, Math.min(width, height) * 0.2); // Fine grid
        
        // Generate grid positions across entire rectangle
        for (let x = margin; x <= buildingWidth - width - margin; x += gridStep) {
          for (let y = margin; y <= buildingHeight - height - margin; y += gridStep) {
            if (isValidPosition(x, y, width, height)) {
              candidates.push({ x, y });
            }
          }
        }
        
        return candidates;
      };
      
      // Sort rooms by placement priority
      const sortedRooms = [...roomsToPlace].sort((a, b) => {
        const priority: {[key: string]: number} = {
          'reception': 1,
          'private-office': 2,
          'conference-room': 3,
          'meeting-room': 3,
          'open-workspace': 4,
          'kitchen': 5,
          'break-room': 5,
          'restroom': 6,
          'storage': 7,
          'server-room': 7,
          'copy-room': 7,
        };
        return (priority[a.type] || 99) - (priority[b.type] || 99);
      });
      
      // SIMPLE GRID-BASED PLACEMENT - Ensures ALL rooms are placed
      sortedRooms.forEach((room) => {
        let scaledSize = room.size * scaleFactor;
        const roomType = ROOM_TYPES[room.type as keyof typeof ROOM_TYPES];
        let placed = false;
        
        // Try different aspect ratios and orientations
        const aspectRatios = [
          { w: 1.4, h: 1.0 },  // Landscape
          { w: 1.0, h: 1.4 },  // Portrait
          { w: 1.2, h: 1.0 },  // Slightly landscape
          { w: 1.0, h: 1.2 },  // Slightly portrait
          { w: 1.0, h: 1.0 },  // Square
        ];
        
        // Try progressively smaller sizes if needed
        for (let sizeMultiplier = 1.0; sizeMultiplier >= 0.3 && !placed; sizeMultiplier -= 0.1) {
          const currentSize = scaledSize * sizeMultiplier;
          const minSize = Math.max(roomType.minSize * 0.5, 20); // Allow smaller minimum
          
          if (currentSize < minSize) continue;
          
          for (const ratio of aspectRatios) {
            if (placed) break;
            
            let width = Math.sqrt(currentSize * (ratio.w / ratio.h));
            let height = currentSize / width;
            
            // Ensure minimum dimensions
            const minDim = 4;
            if (width < minDim) { width = minDim; height = currentSize / width; }
            if (height < minDim) { height = minDim; width = currentSize / height; }
            
            // Try both orientations
            const orientations = [
              { width, height },
              { width: height, height: width }
            ];
            
            for (const orientation of orientations) {
              if (placed) break;
              
              // Generate candidate positions
              const candidates = generateCandidatePositions(orientation.width, orientation.height);
              
              // Try each candidate position
              for (const pos of candidates) {
                if (placed) break;
                
                // Check collision with existing rooms
                if (!checkCollision(pos.x, pos.y, orientation.width, orientation.height)) {
                  // Place the room
                  rooms.push({
                    id: `room-${roomId++}`,
                    type: room.type,
                    name: room.index > 0 ? `${ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name} ${room.index + 1}` : ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name,
                    width: orientation.width,
                    height: orientation.height,
                    x: pos.x,
                    y: pos.y,
                    color: ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].color,
                    quantity: 1,
                    isRequired: room.type === 'reception' || room.type === 'restroom',
                  });
                  placed = true;
                  break;
                }
              }
            }
          }
        }
        
        if (!placed) {
          console.error(`❌ CRITICAL: Failed to place room: ${room.type} (index ${room.index})`);
        }
      });
      
      // Simple validation - just log success
      const totalPlacedArea = rooms.reduce((sum, r) => sum + (r.width * r.height), 0);
      const spaceUtilization = (totalPlacedArea / usableSpace) * 100;
      
      console.log(`✅ Floorplan generated: ${rooms.length} rooms placed (${spaceUtilization.toFixed(1)}% utilization)`);
      
      setPlacedRooms(rooms);
      setIsGenerating(false);
      setShowFloorPlan(true);
    }, 2000);
  };
  
  const drawFloorPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to high resolution
    canvas.width = 1200;
    canvas.height = 900;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const wallThickness = 8;
    const doorWidth = 40;
    
    // Clear canvas with professional background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title and scale
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(`${propertyType} Floor Plan`, padding, 35);
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`Total Area: ${totalSqft.toLocaleString()} sq ft | Scale: 1" = 10'`, padding, 55);
    
    // Calculate building dimensions from total square footage
    const buildingArea = totalSqft;
    let buildingWidth = 0;
    let buildingHeight = 0;
    
    switch (buildingShape) {
      case 'square':
        buildingWidth = Math.sqrt(buildingArea);
        buildingHeight = buildingWidth;
        break;
      case 'rectangle':
        const ratio = 1.5;
        buildingWidth = Math.sqrt(buildingArea * ratio);
        buildingHeight = buildingArea / buildingWidth;
        break;
      case 'l-shape':
        buildingWidth = Math.sqrt(buildingArea * 1.4);
        buildingHeight = buildingWidth * 0.7;
        break;
      case 'u-shape':
        buildingWidth = Math.sqrt(buildingArea * 1.5);
        buildingHeight = buildingWidth * 0.8;
        break;
      case 't-shape':
        buildingWidth = Math.sqrt(buildingArea * 1.4);
        buildingHeight = buildingWidth * 0.9;
        break;
      case 'h-shape':
        buildingWidth = Math.sqrt(buildingArea * 1.5);
        buildingHeight = buildingWidth * 0.85;
        break;
      case 'courtyard':
        buildingWidth = buildingHeight = Math.sqrt(buildingArea * 1.25);
        break;
      case 'plus-shape':
        buildingWidth = buildingHeight = Math.sqrt(buildingArea * 1.3);
        break;
      case 'z-shape':
        buildingWidth = Math.sqrt(buildingArea * 1.45);
        buildingHeight = buildingWidth * 0.75;
        break;
    }
    
    // Scale factor to fit canvas
    const availableWidth = width - (padding * 2);
    const availableHeight = height - padding - 100;
    const scale = Math.min(availableWidth / buildingWidth, availableHeight / buildingHeight) * 0.9;
    
    // Starting position (centered)
    const startX = padding + (availableWidth - buildingWidth * scale) / 2;
    const startY = 80;
    
    // Draw outer walls based on building shape
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = wallThickness;
    ctx.fillStyle = '#F5F5F5';
    const outerWidth = buildingWidth * scale;
    const outerHeight = buildingHeight * scale;
    
    // Draw building shape outline
    ctx.beginPath();
    
    switch (buildingShape) {
      case 'square':
      case 'rectangle':
        ctx.rect(startX, startY, outerWidth, outerHeight);
        break;
        
      case 'l-shape':
        // L-shape: main rectangle + side extension (aligned with isPointInsideShape)
        const lCutoffX = outerWidth * 0.55;
        const lCutoffY = outerHeight * 0.45;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + lCutoffX, startY);
        ctx.lineTo(startX + lCutoffX, startY + lCutoffY);
        ctx.lineTo(startX + outerWidth, startY + lCutoffY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 'u-shape':
        // U-shape: three sections with gap in middle (aligned with isPointInsideShape)
        const uGapLeft = outerWidth * 0.28;
        const uGapRight = outerWidth * 0.72;
        const uGapBottom = outerHeight * 0.45;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + uGapLeft, startY);
        ctx.lineTo(startX + uGapLeft, startY + uGapBottom);
        ctx.lineTo(startX + uGapRight, startY + uGapBottom);
        ctx.lineTo(startX + uGapRight, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 't-shape':
        // T-shape: horizontal top + vertical stem (aligned with isPointInsideShape)
        const tTopHeight = outerHeight * 0.35;
        const tStemLeft = outerWidth * 0.3;
        const tStemRight = outerWidth * 0.7;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + tTopHeight);
        ctx.lineTo(startX + tStemRight, startY + tTopHeight);
        ctx.lineTo(startX + tStemRight, startY + outerHeight);
        ctx.lineTo(startX + tStemLeft, startY + outerHeight);
        ctx.lineTo(startX + tStemLeft, startY + tTopHeight);
        ctx.lineTo(startX, startY + tTopHeight);
        ctx.closePath();
        break;
        
      case 'h-shape':
        // H-shape: two vertical bars connected by horizontal (aligned with isPointInsideShape)
        const hBarWidth = outerWidth * 0.28;
        const hConnectorTop = outerHeight * 0.38;
        const hConnectorBottom = outerHeight * 0.62;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + hBarWidth, startY);
        ctx.lineTo(startX + hBarWidth, startY + hConnectorTop);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + hConnectorTop);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + outerHeight);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + hConnectorBottom);
        ctx.lineTo(startX + hBarWidth, startY + hConnectorBottom);
        ctx.lineTo(startX + hBarWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 'courtyard':
        // Courtyard: outer square with inner square cutout (aligned with isPointInsideShape)
        const courtyardInner = outerWidth * 0.28;
        // Outer rectangle
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        // Inner courtyard (hollow center) - drawn counter-clockwise for cutout
        ctx.moveTo(startX + courtyardInner, startY + courtyardInner);
        ctx.lineTo(startX + courtyardInner, startY + outerHeight - courtyardInner);
        ctx.lineTo(startX + outerWidth - courtyardInner, startY + outerHeight - courtyardInner);
        ctx.lineTo(startX + outerWidth - courtyardInner, startY + courtyardInner);
        ctx.closePath();
        break;
        
      case 'plus-shape':
        // Plus shape: cross with four wings (aligned with isPointInsideShape)
        const plusArmWidth = outerWidth * 0.38;
        const plusArmOffset = (outerWidth - plusArmWidth) / 2;
        const plusArmHeightOffset = (outerHeight - plusArmWidth) / 2;
        ctx.moveTo(startX + plusArmOffset, startY);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + plusArmHeightOffset);
        ctx.lineTo(startX + outerWidth, startY + plusArmHeightOffset);
        ctx.lineTo(startX + outerWidth, startY + plusArmHeightOffset + plusArmWidth);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + plusArmHeightOffset + plusArmWidth);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + outerHeight);
        ctx.lineTo(startX + plusArmOffset, startY + outerHeight);
        ctx.lineTo(startX + plusArmOffset, startY + plusArmHeightOffset + plusArmWidth);
        ctx.lineTo(startX, startY + plusArmHeightOffset + plusArmWidth);
        ctx.lineTo(startX, startY + plusArmHeightOffset);
        ctx.lineTo(startX + plusArmOffset, startY + plusArmHeightOffset);
        ctx.closePath();
        break;
        
      case 'z-shape':
        // Z-shape: full width top bar + narrow middle connector + full width bottom bar
        const zTopH = outerHeight * 0.32;
        const zBottomS = outerHeight * 0.68;
        const zLeftOff = outerWidth * 0.35;
        const zRightOff = outerWidth * 0.65;
        // Draw Z shape clockwise
        ctx.moveTo(startX, startY); // Top-left corner
        ctx.lineTo(startX + outerWidth, startY); // Top-right corner
        ctx.lineTo(startX + outerWidth, startY + zTopH); // Right side of top bar
        ctx.lineTo(startX + zRightOff, startY + zTopH); // Inner corner right
        ctx.lineTo(startX + zRightOff, startY + zBottomS); // Down the middle right
        ctx.lineTo(startX + outerWidth, startY + zBottomS); // Right side of bottom bar
        ctx.lineTo(startX + outerWidth, startY + outerHeight); // Bottom-right corner
        ctx.lineTo(startX, startY + outerHeight); // Bottom-left corner
        ctx.lineTo(startX, startY + zBottomS); // Left side of bottom bar
        ctx.lineTo(startX + zLeftOff, startY + zBottomS); // Inner corner left
        ctx.lineTo(startX + zLeftOff, startY + zTopH); // Up the middle left
        ctx.lineTo(startX, startY + zTopH); // Left side of top bar
        ctx.closePath();
        break;
    }
    
    ctx.fill();
    ctx.stroke();
    
    // Scale rooms to fit canvas (rooms are already placed in generateFloorPlan)
    const totalRoomArea = placedRooms.reduce((sum, r) => sum + (r.width * r.height), 0);
    const buildingAreaScaled = outerWidth * outerHeight;
    const roomScale = Math.min(
      Math.sqrt((buildingAreaScaled * 0.88) / totalRoomArea), // 88% for rooms, 12% for circulation
      1.0 // Don't scale up
    );
    
    // Draw corridors/hallways (light gray background) - simple rectangle
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(startX, startY, outerWidth, outerHeight);
    
    // Draw rooms with walls, doors, labels
    placedRooms.forEach((room) => {
      // Scale room dimensions
      const w = room.width * scale * roomScale;
      const h = room.height * scale * roomScale;
      const x = startX + room.x * scale;
      const y = startY + room.y * scale;
      // Fill room with color
      ctx.fillStyle = room.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      
      // Draw room walls (thick lines)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = wallThickness - 2;
      ctx.strokeRect(x, y, w, h);
      
      // Draw door (smart placement - prefer wall closest to building center/entrance)
      // Reception: door on top wall (entrance side)
      // Other rooms: door on wall closest to center
      let doorX, doorY, doorWall;
      const _buildingCenterX = startX + outerWidth / 2;
      const _buildingCenterY = startY + outerHeight / 2;
      const roomCenterX = x + w / 2;
      const roomCenterY = y + h / 2;
      
      if (room.type === 'reception') {
        // Reception: door on top wall (entrance)
        doorWall = 'top';
        doorY = y;
        doorX = x + w / 2 - doorWidth / 2;
      } else {
        // Find closest wall to building center
        const distToTop = Math.abs(roomCenterY - startY);
        const distToBottom = Math.abs(roomCenterY - (startY + outerHeight));
        const distToLeft = Math.abs(roomCenterX - startX);
        const distToRight = Math.abs(roomCenterX - (startX + outerWidth));
        
        const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
        
        if (minDist === distToTop) {
          doorWall = 'top';
          doorY = y;
          doorX = x + w / 2 - doorWidth / 2;
        } else if (minDist === distToBottom) {
          doorWall = 'bottom';
          doorY = y + h;
          doorX = x + w / 2 - doorWidth / 2;
        } else if (minDist === distToLeft) {
          doorWall = 'left';
          doorX = x;
          doorY = y + h / 2 - doorWidth / 2;
        } else {
          doorWall = 'right';
          doorX = x + w;
          doorY = y + h / 2 - doorWidth / 2;
        }
      }
      
      // Clear door gap in wall
      ctx.strokeStyle = room.color;
      ctx.lineWidth = wallThickness;
      ctx.beginPath();
      if (doorWall === 'top' || doorWall === 'bottom') {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorWidth, doorY);
      } else {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX, doorY + doorWidth);
      }
      ctx.stroke();
      
      // Draw door arc (swing)
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (doorWall === 'top') {
        ctx.arc(doorX, doorY, doorWidth, 0, Math.PI / 2);
      } else if (doorWall === 'bottom') {
        ctx.arc(doorX, doorY, doorWidth, Math.PI, Math.PI * 1.5);
      } else if (doorWall === 'left') {
        ctx.arc(doorX, doorY, doorWidth, Math.PI / 2, Math.PI);
      } else {
        ctx.arc(doorX, doorY, doorWidth, -Math.PI / 2, 0);
      }
      ctx.stroke();
      
      // Draw door symbol (line showing door panel)
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (doorWall === 'top') {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorWidth * 0.7, doorY - doorWidth * 0.7);
      } else if (doorWall === 'bottom') {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorWidth * 0.7, doorY + doorWidth * 0.7);
      } else if (doorWall === 'left') {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX - doorWidth * 0.7, doorY + doorWidth * 0.7);
      } else {
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX + doorWidth * 0.7, doorY + doorWidth * 0.7);
      }
      ctx.stroke();
      
      // Room dimensions (convert from scaled units to feet)
      // Assuming scale: 1 unit = ~1 foot (approximate)
      const roomWidthFt = Math.round(room.width);
      const roomHeightFt = Math.round(room.height);
      const roomSqft = Math.round(room.width * room.height);
      
      // Draw measurements on walls
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      
      // Width measurement (bottom)
      ctx.fillText(`${roomWidthFt}'`, x + w / 2, y + h + 15);
      
      // Height measurement (right side, rotated)
      ctx.save();
      ctx.translate(x + w + 15, y + h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${roomHeightFt}'`, 0, 0);
      ctx.restore();
      
      // Room label (no background box)
      const roomLabelX = x + w / 2;
      const roomLabelY = y + h / 2;
      
      // Room name with white outline for visibility
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // White outline/stroke for better visibility
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeText(room.name, roomLabelX, roomLabelY - 10);
      
      // Black text on top
      ctx.fillStyle = '#000000';
      ctx.fillText(room.name, roomLabelX, roomLabelY - 10);
      
      // Room square footage with outline
      ctx.font = 'bold 11px Arial, sans-serif';
      
      // White outline
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeText(`${roomSqft} sq ft`, roomLabelX, roomLabelY + 8);
      
      // Dark text on top
      ctx.fillStyle = '#333333';
      ctx.fillText(`${roomSqft} sq ft`, roomLabelX, roomLabelY + 8);
      
      // Furniture, outlets, and light fixtures removed for clean floor plan
    });
    
    // Redraw building outline to ensure it's visible on top
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = wallThickness;
    ctx.beginPath();
    
    switch (buildingShape) {
      case 'square':
      case 'rectangle':
        ctx.rect(startX, startY, outerWidth, outerHeight);
        break;
        
      case 'l-shape':
        const lMainWidth = outerWidth * 0.6;
        const lExtHeight = outerHeight * 0.5;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + lMainWidth, startY);
        ctx.lineTo(startX + lMainWidth, startY + lExtHeight);
        ctx.lineTo(startX + outerWidth, startY + lExtHeight);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 'u-shape':
        const uSideWidth = outerWidth * 0.25;
        const uGapWidth = outerWidth * 0.5;
        const uGapDepth = outerHeight * 0.4;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX + uSideWidth + uGapWidth, startY + outerHeight);
        ctx.lineTo(startX + uSideWidth + uGapWidth, startY + uGapDepth);
        ctx.lineTo(startX + uSideWidth, startY + uGapDepth);
        ctx.lineTo(startX + uSideWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 't-shape':
        const tTopHeight = outerHeight * 0.3;
        const tStemWidth = outerWidth * 0.4;
        const tStemOffset = (outerWidth - tStemWidth) / 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + tTopHeight);
        ctx.lineTo(startX + tStemOffset + tStemWidth, startY + tTopHeight);
        ctx.lineTo(startX + tStemOffset + tStemWidth, startY + outerHeight);
        ctx.lineTo(startX + tStemOffset, startY + outerHeight);
        ctx.lineTo(startX + tStemOffset, startY + tTopHeight);
        ctx.lineTo(startX, startY + tTopHeight);
        ctx.closePath();
        break;
        
      case 'h-shape':
        const hBarWidth = outerWidth * 0.25;
        const hConnectorHeight = outerHeight * 0.3;
        const hConnectorTop = (outerHeight - hConnectorHeight) / 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + hBarWidth, startY);
        ctx.lineTo(startX + hBarWidth, startY + hConnectorTop);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + hConnectorTop);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + outerHeight);
        ctx.lineTo(startX + outerWidth - hBarWidth, startY + hConnectorTop + hConnectorHeight);
        ctx.lineTo(startX + hBarWidth, startY + hConnectorTop + hConnectorHeight);
        ctx.lineTo(startX + hBarWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        break;
        
      case 'courtyard':
        const courtyardInnerMargin = outerWidth * 0.25;
        // Outer perimeter
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        // Inner courtyard outline
        ctx.moveTo(startX + courtyardInnerMargin, startY + courtyardInnerMargin);
        ctx.lineTo(startX + outerWidth - courtyardInnerMargin, startY + courtyardInnerMargin);
        ctx.lineTo(startX + outerWidth - courtyardInnerMargin, startY + outerHeight - courtyardInnerMargin);
        ctx.lineTo(startX + courtyardInnerMargin, startY + outerHeight - courtyardInnerMargin);
        ctx.closePath();
        break;
        
      case 'plus-shape':
        const plusArmWidth = outerWidth * 0.35;
        const plusArmOffset = (outerWidth - plusArmWidth) / 2;
        ctx.moveTo(startX + plusArmOffset, startY);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + plusArmOffset);
        ctx.lineTo(startX + outerWidth, startY + plusArmOffset);
        ctx.lineTo(startX + outerWidth, startY + plusArmOffset + plusArmWidth);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + plusArmOffset + plusArmWidth);
        ctx.lineTo(startX + plusArmOffset + plusArmWidth, startY + outerHeight);
        ctx.lineTo(startX + plusArmOffset, startY + outerHeight);
        ctx.lineTo(startX + plusArmOffset, startY + plusArmOffset + plusArmWidth);
        ctx.lineTo(startX, startY + plusArmOffset + plusArmWidth);
        ctx.lineTo(startX, startY + plusArmOffset);
        ctx.lineTo(startX + plusArmOffset, startY + plusArmOffset);
        ctx.closePath();
        break;
        
      case 'z-shape':
        const zTopHeight = outerHeight * 0.35;
        const zMidHeight = outerHeight * 0.3;
        const zOffset = outerWidth * 0.3;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + zTopHeight);
        ctx.lineTo(startX + zOffset + (outerWidth - zOffset) * 0.5, startY + zTopHeight);
        ctx.lineTo(startX + outerWidth, startY + zTopHeight + zMidHeight);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.lineTo(startX, startY + zTopHeight + zMidHeight);
        ctx.lineTo(startX + (outerWidth - zOffset) * 0.5, startY + zTopHeight + zMidHeight);
        ctx.lineTo(startX, startY + zTopHeight);
        ctx.closePath();
        break;
    }
    
    ctx.stroke();
    
    // Draw building entrance (main door)
    const entranceWidth = 60;
    const entranceX = startX + outerWidth / 2 - entranceWidth / 2;
    const entranceY = startY;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = wallThickness + 2;
    ctx.beginPath();
    ctx.moveTo(entranceX, entranceY);
    ctx.lineTo(entranceX + entranceWidth, entranceY);
    ctx.stroke();
    
    // Entrance label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRANCE', entranceX + entranceWidth / 2, entranceY - 10);
    
    // Draw compass (North arrow)
    const compassX = startX + outerWidth - 40;
    const compassY = startY + 40;
    
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(compassX, compassY + 20);
    ctx.lineTo(compassX, compassY - 20);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 20);
    ctx.lineTo(compassX - 5, compassY - 10);
    ctx.lineTo(compassX + 5, compassY - 10);
    ctx.closePath();
    ctx.fill();
    
    // N label
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('N', compassX, compassY - 30);
    
    // Draw scale bar (representing 10 feet)
    const scaleBarY = height - 40;
    const scaleBarX = padding;
    const scaleBarFeet = 10; // Represent 10 feet
    const scaleBarLength = scaleBarFeet * scale; // Convert feet to canvas pixels
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarLength, scaleBarY);
    ctx.stroke();
    
    // Scale bar ticks
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY - 8);
    ctx.lineTo(scaleBarX, scaleBarY + 8);
    ctx.moveTo(scaleBarX + scaleBarLength, scaleBarY - 8);
    ctx.lineTo(scaleBarX + scaleBarLength, scaleBarY + 8);
    ctx.stroke();
    
    // Scale bar label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${scaleBarFeet}'`, scaleBarX + scaleBarLength / 2, scaleBarY - 15);
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Scale: 1" = 10\'', scaleBarX + scaleBarLength / 2, scaleBarY + 25);
    
    // Draw legend
    const legendX = width - 250;
    const legendY = height - 200;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(legendX, legendY, 220, 180);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 220, 180);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LEGEND', legendX + 10, legendY + 18);
    
    // Room type colors
    const uniqueTypes = Array.from(new Set(placedRooms.map(r => r.type)));
    uniqueTypes.slice(0, 8).forEach((type, i) => {
      const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
      const y = legendY + 35 + i * 18;
      
      // Color box
      ctx.fillStyle = roomType.color;
      ctx.fillRect(legendX + 10, y - 8, 12, 12);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(legendX + 10, y - 8, 12, 12);
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial, sans-serif';
      ctx.fillText(roomType.name, legendX + 28, y + 2);
    });
  };
  
  const exportToPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `floor-plan-${propertyType.toLowerCase()}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  const exportToPDF = () => {
    // Create a comprehensive PDF report
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const canvas = canvasRef.current;
    const floorPlanImage = canvas ? canvas.toDataURL('image/png') : '';
    
    // Calculate additional metrics
    const costPerEmployee = Math.round(estimatedTotalCost / employees);
    const avgRoomSize = Math.round(totalRoomSqft / totalRooms);
    const occupancyDensity = Math.round(totalSqft / employees);
    
    // Get room breakdown with costs (using the same calculation as main component)
    const roomBreakdown = Object.entries(selectedRooms)
      .filter(([_, config]) => config.enabled)
      .map(([type, config]) => {
        const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
        const size = config.customSize || roomType.defaultSize;
        const totalSize = size * config.quantity;
        const roomCost = totalSize * roomType.costPerSqft;
        return {
          name: roomType.name,
          quantity: config.quantity,
          sizeEach: size,
          totalSize: totalSize,
          color: roomType.color,
          cost: roomCost,
          costPerSqft: roomType.costPerSqft,
        };
      });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Space Calculator Report - ${propertyType}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              background: #fff;
              color: #000;
            }
            .header {
              background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 10px;
              color: #0a0a0a;
            }
            .subtitle {
              font-size: 16px;
              color: #333;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 3px solid #FFD700;
              color: #0a0a0a;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #e0e0e0;
              text-align: center;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #0a0a0a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              background: #fff;
            }
            th, td {
              text-align: left;
              padding: 12px;
              border-bottom: 1px solid #e0e0e0;
            }
            th {
              background: #f5f5f5;
              font-weight: bold;
              color: #0a0a0a;
              font-size: 14px;
            }
            td {
              color: #333;
              font-size: 13px;
            }
            .room-color {
              width: 24px;
              height: 24px;
              border-radius: 4px;
              display: inline-block;
              margin-right: 10px;
              border: 1px solid #ccc;
              vertical-align: middle;
            }
            .floor-plan {
              width: 100%;
              max-width: 900px;
              margin: 20px auto;
              border: 2px solid #ccc;
              border-radius: 8px;
              page-break-before: always;
            }
            .cost-breakdown {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #e0e0e0;
            }
            .cost-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .cost-row:last-child {
              border-bottom: none;
              font-weight: bold;
              font-size: 18px;
              padding-top: 15px;
              margin-top: 10px;
              border-top: 2px solid #FFD700;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .section { page-break-inside: avoid; }
              .floor-plan { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📐 Space Calculator Report</h1>
            <div class="subtitle">
              ${propertyType} Building | ${employees} Employees | Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">📊 Key Metrics</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total Space</div>
                <div class="stat-value">${totalSqft.toLocaleString()}<span style="font-size: 14px;"> sq ft</span></div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Rooms</div>
                <div class="stat-value">${totalRooms}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Efficiency</div>
                <div class="stat-value">${efficiencyRating}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Est. Cost</div>
                <div class="stat-value">${formatCost(estimatedTotalCost)}</div>
              </div>
            </div>
            
            <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 15px;">
              <div class="stat-card">
                <div class="stat-label">Space per Employee</div>
                <div class="stat-value" style="font-size: 24px;">${sqftPerPerson} sq ft</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Circulation %</div>
                <div class="stat-value" style="font-size: 24px;">${circulationPercentage}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Cost per Employee</div>
                <div class="stat-value" style="font-size: 24px;">$${costPerEmployee.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">🏗️ Building Specifications</div>
            <table>
              <tr>
                <th>Property Type</th>
                <td>${propertyType}</td>
                <th>Building Shape</th>
                <td>${getBuildingShapeName(buildingShape)} (Auto-selected)</td>
              </tr>
              <tr>
                <th>Number of Employees</th>
                <td>${employees}</td>
                <th>Avg Room Size</th>
                <td>${avgRoomSize} sq ft</td>
              </tr>
              <tr>
                <th>Sq Ft per Person</th>
                <td>${sqftPerPerson} sq ft</td>
                <th>Occupancy Density</th>
                <td>${occupancyDensity} sq ft/person</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">💰 Cost Breakdown</div>
            <div class="cost-breakdown">
              <div class="cost-row">
                <span>Base Construction (${totalSqft.toLocaleString()} sq ft × $80/sq ft)</span>
                <strong>${formatCost(Math.round(costBreakdown.baseConstruction))}</strong>
              </div>
              <div class="cost-row">
                <span>Room Buildouts (${totalRoomSqft.toLocaleString()} sq ft, variable rates)</span>
                <strong>${formatCost(Math.round(costBreakdown.roomCosts))}</strong>
              </div>
              <div class="cost-row">
                <span>Circulation/Corridors (${(totalSqft - totalRoomSqft).toLocaleString()} sq ft × $90/sq ft)</span>
                <strong>${formatCost(Math.round(costBreakdown.circulation))}</strong>
              </div>
              <div class="cost-row">
                <span>MEP Systems (Base + Special Systems)</span>
                <strong>${formatCost(Math.round(costBreakdown.mep))}</strong>
              </div>
              <div class="cost-row">
                <span>Interior Finishes (Base + Premium)</span>
                <strong>${formatCost(Math.round(costBreakdown.finishes))}</strong>
              </div>
              <div class="cost-row">
                <span>TOTAL ESTIMATED COST</span>
                <strong style="color: #FFD700;">${formatCost(estimatedTotalCost)}</strong>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">🚪 Room Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Quantity</th>
                  <th>Size Each</th>
                  <th>Total Size</th>
                  <th>Cost/sqft</th>
                  <th>Total Cost</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                ${roomBreakdown.map((room) => `
                  <tr>
                    <td>
                      <span class="room-color" style="background-color: ${room.color}"></span>
                      ${room.name}
                    </td>
                    <td>${room.quantity}</td>
                    <td>${room.sizeEach} sq ft</td>
                    <td><strong>${room.totalSize.toLocaleString()} sq ft</strong></td>
                    <td>$${room.costPerSqft}</td>
                    <td><strong>$${Math.round(room.cost).toLocaleString()}</strong></td>
                    <td>${((room.totalSize / totalRoomSqft) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
                <tr style="background: #f5f5f5; font-weight: bold;">
                  <td colspan="3">TOTAL ROOM AREA</td>
                  <td>${totalRoomSqft.toLocaleString()} sq ft</td>
                  <td>-</td>
                  <td>${formatCost(Math.round(costBreakdown.roomCosts))}</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td colspan="3">Circulation & Corridors</td>
                  <td>${(totalSqft - totalRoomSqft).toLocaleString()} sq ft</td>
                  <td>$90</td>
                  <td>${formatCost(Math.round(costBreakdown.circulation))}</td>
                  <td>${circulationPercentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          
          ${floorPlanImage ? `
            <div class="section">
              <div class="section-title">🏢 Floor Plan</div>
              <img src="${floorPlanImage}" alt="Floor Plan" class="floor-plan" />
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Space Calculator Report</strong> | Generated by Commercial Real Estate Platform</p>
            <p>This is an estimate only. Actual costs and requirements may vary. Consult with professionals for accurate planning.</p>
          </div>
          
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  
  useEffect(() => {
    if (showFloorPlan && placedRooms.length > 0) {
      drawFloorPlan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFloorPlan, placedRooms]);
  
  // Calculate statistics
  const totalRooms = Object.entries(selectedRooms)
    .filter(([_, config]) => config.enabled)
    .reduce((sum, [_, config]) => sum + config.quantity, 0);
  
  const totalRoomSqft = Object.entries(selectedRooms)
    .filter(([_, config]) => config.enabled)
    .reduce((sum, [type, config]) => {
      const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
      const size = config.customSize || roomType.defaultSize;
      return sum + (size * config.quantity);
    }, 0);
  
  const circulationPercentage = ((totalSqft - totalRoomSqft) / totalSqft * 100).toFixed(1);
  const efficiencyRating = (totalRoomSqft / totalSqft * 100).toFixed(1);
  
  // Calculate detailed cost breakdown based on room configurations
  const calculateDetailedCosts = () => {
    let totalRoomCost = 0;
    const roomCostBreakdown: {[key: string]: { sqft: number; cost: number; quantity: number }} = {};
    
    // Calculate cost for each room type based on quantity and size
    Object.entries(selectedRooms).forEach(([type, config]) => {
      if (config.enabled) {
        const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
        const roomSize = config.customSize || roomType.defaultSize;
        const roomCostPerSqft = roomType.costPerSqft;
        const quantity = config.quantity;
        const totalRoomSqft = roomSize * quantity;
        const roomCost = totalRoomSqft * roomCostPerSqft;
        
        totalRoomCost += roomCost;
        roomCostBreakdown[type] = {
          sqft: totalRoomSqft,
          cost: roomCost,
          quantity: quantity,
        };
      }
    });
    
    // Base construction cost (foundation, structure, shell) - $80/sqft
    const baseConstructionCost = totalSqft * 80;
    
    // Circulation/corridor cost (lower cost per sqft) - $90/sqft
    const circulationSqft = totalSqft - totalRoomSqft;
    const circulationCost = circulationSqft * 90;
    
    // MEP systems (Mechanical, Electrical, Plumbing) - $25/sqft base
    const mepBaseCost = totalSqft * 25;
    
    // Additional MEP costs for special rooms
    let mepAdditionalCost = 0;
    Object.entries(selectedRooms).forEach(([type, config]) => {
      if (config.enabled) {
        const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
        const roomSize = config.customSize || roomType.defaultSize;
        const quantity = config.quantity;
        const totalRoomSqft = roomSize * quantity;
        
        // Additional MEP costs for rooms requiring special systems
        if (type === 'kitchen' || type === 'restroom') {
          mepAdditionalCost += totalRoomSqft * 15; // Plumbing premium
        }
        if (type === 'server-room') {
          mepAdditionalCost += totalRoomSqft * 30; // HVAC and power premium
        }
        if (type === 'conference-room') {
          mepAdditionalCost += totalRoomSqft * 10; // AV systems
        }
      }
    });
    
    const totalMepCost = mepBaseCost + mepAdditionalCost;
    
    // Interior finishes (base) - $30/sqft
    const baseFinishesCost = totalSqft * 30;
    
    // Premium finishes for specific rooms
    let premiumFinishesCost = 0;
    Object.entries(selectedRooms).forEach(([type, config]) => {
      if (config.enabled) {
        const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
        const roomSize = config.customSize || roomType.defaultSize;
        const quantity = config.quantity;
        const totalRoomSqft = roomSize * quantity;
        
        // Premium finishes for high-visibility areas
        if (type === 'reception') {
          premiumFinishesCost += totalRoomSqft * 20; // Premium finishes
        }
        if (type === 'conference-room' || type === 'meeting-room') {
          premiumFinishesCost += totalRoomSqft * 15; // Enhanced finishes
        }
      }
    });
    
    const totalFinishesCost = baseFinishesCost + premiumFinishesCost;
    
    // Total estimated cost
    const totalEstimatedCost = baseConstructionCost + totalRoomCost + circulationCost + totalMepCost + totalFinishesCost;
    
    return {
      baseConstruction: baseConstructionCost,
      roomCosts: totalRoomCost,
      roomCostBreakdown: roomCostBreakdown,
      circulation: circulationCost,
      mep: totalMepCost,
      finishes: totalFinishesCost,
      total: totalEstimatedCost,
    };
  };
  
  const costBreakdown = calculateDetailedCosts();
  const estimatedTotalCost = Math.round(costBreakdown.total);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary-black flex items-center gap-2">
                <Calculator size={28} className="text-accent-yellow" />
                Smart Space Calculator
              </h1>
              <p className="text-sm text-custom-gray">Calculate your ideal commercial space requirements</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Split Layout */}
      <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Panel - Calculator */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
            
            {/* Templates */}
            <div>
              <h3 className="text-xl font-bold text-primary-black mb-4 flex items-center gap-2">
                <Layout size={24} className="text-accent-yellow" />
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-yellow hover:bg-yellow-50 transition-all text-left group"
                  >
                    <div className="font-bold text-base text-primary-black mb-1 group-hover:text-accent-yellow transition-colors">
                      {template.name}
                    </div>
                    <div className="text-sm text-custom-gray">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-primary-black mb-6 flex items-center gap-2">
                <Building2 size={24} className="text-accent-yellow" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors"
                  >
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Medical">Medical</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>
              
              {/* Building Shape Info (Auto-determined) */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Building2 size={24} className="text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-primary-black mb-1">Building Shape</div>
                    <div className="text-lg font-bold text-blue-900">{getBuildingShapeName(buildingShape)}</div>
                    <div className="text-xs text-blue-700 mt-1">
                      Automatically determined based on {propertyType} property type
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Number of Employees */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-primary-black mb-2">
                  Number of Employees: <span className="text-accent-yellow">{employees}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
                <div className="flex justify-between text-xs text-custom-gray mt-1">
                  <span>1</span>
                  <span>200</span>
                </div>
              </div>
              
              {/* Square Feet Per Person */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-primary-black mb-2">
                  Square Feet Per Person: <span className="text-accent-yellow">{sqftPerPerson}</span>
                </label>
                <input
                  type="range"
                  min="80"
                  max="300"
                  step="10"
                  value={sqftPerPerson}
                  onChange={(e) => setSqftPerPerson(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-yellow"
                />
                <div className="flex justify-between text-xs text-custom-gray mt-1">
                  <span>80 (Dense)</span>
                  <span>300 (Spacious)</span>
                </div>
              </div>
              
              {/* Total Square Footage Display */}
              <div className="mt-6 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/10 border-2 border-accent-yellow rounded-xl p-6">
                <div className="text-sm font-semibold text-primary-black mb-2">Calculated Total Space Required</div>
                <div className="text-4xl font-bold text-primary-black">{totalSqft.toLocaleString()} sq ft</div>
                <div className="text-sm text-custom-gray mt-1">{employees} employees × {sqftPerPerson} sq ft/person</div>
              </div>
            </div>
            
            {/* Room Selection */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-primary-black mb-6 flex items-center gap-2">
                <Zap size={24} className="text-accent-yellow" />
                Room Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ROOM_TYPES).map(([key, roomType]) => (
                  <div key={key} className="border-2 border-gray-200 rounded-lg p-4 hover:border-accent-yellow transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedRooms[key]?.enabled || false}
                          onChange={(e) => {
                            setSelectedRooms({
                              ...selectedRooms,
                              [key]: {
                                ...selectedRooms[key],
                                enabled: e.target.checked,
                                quantity: selectedRooms[key]?.quantity || 1,
                              },
                            });
                          }}
                          className="w-5 h-5 text-accent-yellow focus:ring-accent-yellow rounded"
                        />
                        <span className="font-semibold text-base">{roomType.name}</span>
                      </label>
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: roomType.color }}
                      />
                    </div>
                    
                    {selectedRooms[key]?.enabled && (
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="text-xs font-semibold text-custom-gray mb-1 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={selectedRooms[key]?.quantity || 1}
                            onChange={(e) => {
                              setSelectedRooms({
                                ...selectedRooms,
                                [key]: {
                                  ...selectedRooms[key],
                                  quantity: parseInt(e.target.value) || 1,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent-yellow"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-custom-gray mb-1 block">
                            Size (sq ft)
                          </label>
                          <input
                            type="number"
                            min={roomType.minSize}
                            max="1000"
                            step="10"
                            placeholder={roomType.defaultSize.toString()}
                            value={selectedRooms[key]?.customSize || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value && value >= roomType.minSize) {
                                setSelectedRooms({
                                  ...selectedRooms,
                                  [key]: {
                                    ...selectedRooms[key],
                                    customSize: value,
                                  },
                                });
                              } else if (e.target.value === '') {
                                setSelectedRooms({
                                  ...selectedRooms,
                                  [key]: {
                                    ...selectedRooms[key],
                                    customSize: undefined,
                                  },
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent-yellow"
                          />
                          <div className="text-xs text-custom-gray mt-1">
                            Min: {roomType.minSize} sq ft | Default: {roomType.defaultSize} sq ft
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-primary-black mb-6 flex items-center gap-2">
                <DollarSign size={24} className="text-accent-yellow" />
                Estimated Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-custom-gray mb-1">Total Rooms</div>
                  <div className="text-3xl font-bold text-primary-black">{totalRooms}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-custom-gray mb-1">Circulation</div>
                  <div className="text-3xl font-bold text-primary-black">{circulationPercentage}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-custom-gray mb-1">Efficiency</div>
                  <div className="text-3xl font-bold text-primary-black">{efficiencyRating}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-custom-gray mb-1">Est. Cost</div>
                  <div className="text-2xl font-bold text-primary-black">{formatCost(estimatedTotalCost)}</div>
                </div>
              </div>
            </div>
            
            
            </div>
          </div>
          
          {/* Right Panel - Live Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Total Space Required - Sticky */}
            <div className="bg-gradient-to-br from-accent-yellow via-yellow-400 to-accent-yellow rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-3">
                <Calculator size={28} className="text-primary-black" />
                <h3 className="text-lg font-bold text-primary-black">Calculated Total Space</h3>
              </div>
              <div className="text-5xl font-extrabold text-primary-black mb-2">
                {totalSqft.toLocaleString()}
                <span className="text-2xl ml-2">sq ft</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-black/80">
                <Users size={16} />
                <span>{employees} employees × {sqftPerPerson} sq ft/person</span>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-black/20">
                <div className="text-sm text-primary-black/80 mb-1">Building Shape</div>
                <div className="text-lg font-bold text-primary-black">{getBuildingShapeName(buildingShape)}</div>
                <div className="text-xs text-primary-black/60 mt-1">Auto-selected for {propertyType}</div>
              </div>
            </div>
            
            {/* Statistics Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                <DollarSign size={24} className="text-accent-yellow" />
                Live Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border-2 border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Total Rooms</div>
                  <div className="text-3xl font-bold text-blue-900">{totalRooms}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border-2 border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">Circulation</div>
                  <div className="text-3xl font-bold text-green-900">{circulationPercentage}%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border-2 border-purple-200">
                  <div className="text-xs text-purple-600 font-semibold mb-1">Efficiency</div>
                  <div className="text-3xl font-bold text-purple-900">{efficiencyRating}%</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border-2 border-orange-200">
                  <div className="text-xs text-orange-600 font-semibold mb-1">Est. Cost</div>
                  <div className="text-2xl font-bold text-orange-900">{formatCost(estimatedTotalCost)}</div>
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-semibold text-primary-black mb-2">Cost Breakdown</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Base Construction</span>
                    <span className="font-semibold">{formatCost(Math.round(totalSqft * 100))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Interior Finishes</span>
                    <span className="font-semibold">{formatCost(Math.round(totalSqft * 30))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">MEP Systems</span>
                    <span className="font-semibold">{formatCost(Math.round(totalSqft * 20))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                    <span>Total Estimate</span>
                    <span className="text-accent-yellow">{formatCost(estimatedTotalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ready to Generate */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                <CheckCircle size={24} className="text-green-500" />
                Ready to Generate
              </h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-sm text-green-800 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="font-semibold">Your configuration is ready! Click below to generate your floor plan.</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={generateFloorPlan}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isGenerating
                    ? 'bg-accent-yellow/70 text-primary-black cursor-wait'
                    : 'bg-accent-yellow text-primary-black hover:bg-yellow-400 hover:shadow-xl'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-black"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Layout size={24} />
                    Generate Floor Plan
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floor Plan Modal */}
      <AnimatePresence>
        {showFloorPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFloorPlan(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent-yellow to-yellow-400 px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-black">Your Floor Plan</h2>
                      <p className="text-sm text-primary-black/80">
                        {propertyType} • {totalSqft.toLocaleString()} sq ft • {placedRooms.length} rooms placed • {getBuildingShapeName(buildingShape)} Shape
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFloorPlan(false)}
                      className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                    >
                      <X size={28} className="text-primary-black" />
                    </button>
                  </div>
                  
                  {/* Room Summary - Show all placed rooms */}
                  {placedRooms.length > 0 && (
                    <div className="bg-white/90 rounded-lg p-3 mt-3">
                      <div className="text-xs font-semibold text-primary-black mb-2">Placed Rooms ({placedRooms.length}):</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          placedRooms.reduce((acc, room) => {
                            const key = room.type;
                            if (!acc[key]) {
                              acc[key] = { name: room.name.split(' ')[0] === ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name 
                                ? ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name 
                                : room.name.split(' ').slice(0, -1).join(' '), count: 0, color: room.color };
                            }
                            acc[key].count++;
                            return acc;
                          }, {} as {[key: string]: { name: string; count: number; color: string }})
                        ).map(([type, info]) => (
                          <div
                            key={type}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white/80 rounded text-xs font-medium text-primary-black border border-primary-black/20"
                          >
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: info.color }}
                            />
                            <span>{info.name}: {info.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Canvas */}
                <div className="p-6 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-inner p-4">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="text-sm text-custom-gray">
                    Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                    <button
                      onClick={() => setShowFloorPlan(false)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-primary-black hover:bg-gray-100 transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={exportToPNG}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Download size={20} />
                      Download PNG
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="px-6 py-3 bg-accent-yellow rounded-lg font-semibold text-primary-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Download size={20} />
                      Download PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}

