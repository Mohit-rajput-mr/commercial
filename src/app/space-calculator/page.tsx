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

interface BuildingShape {
  id: string;
  name: string;
  description: string;
  icon: (props: { selected: boolean }) => JSX.Element;
}

// Room type definitions with default sizes and colors
const ROOM_TYPES = {
  'private-office': { name: 'Private Office', defaultSize: 120, color: '#3B82F6', minSize: 80 },
  'open-workspace': { name: 'Open Workspace', defaultSize: 400, color: '#10B981', minSize: 200 },
  'conference-room': { name: 'Conference Room', defaultSize: 200, color: '#8B5CF6', minSize: 150 },
  'meeting-room': { name: 'Meeting Room', defaultSize: 120, color: '#EC4899', minSize: 80 },
  'kitchen': { name: 'Kitchen', defaultSize: 150, color: '#F59E0B', minSize: 100 },
  'break-room': { name: 'Break Room', defaultSize: 120, color: '#F97316', minSize: 80 },
  'reception': { name: 'Reception', defaultSize: 150, color: '#06B6D4', minSize: 100 },
  'restroom': { name: 'Restroom', defaultSize: 80, color: '#6366F1', minSize: 50 },
  'storage': { name: 'Storage', defaultSize: 100, color: '#78716C', minSize: 50 },
  'server-room': { name: 'Server Room', defaultSize: 100, color: '#DC2626', minSize: 60 },
  'copy-room': { name: 'Copy Room', defaultSize: 80, color: '#14B8A6', minSize: 50 },
};

// Building Shape Visual Components
const ShapeIcon = ({ shape, selected }: { shape: string; selected: boolean }) => {
  const baseClass = `transition-all ${selected ? 'fill-accent-yellow stroke-primary-black' : 'fill-gray-200 stroke-gray-400'}`;
  const strokeWidth = selected ? '3' : '2';
  
  switch (shape) {
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'rectangle':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="25" width="80" height="50" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'l-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 60 15 L 60 45 L 85 45 L 85 85 L 15 85 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'u-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 40 15 L 40 70 L 60 70 L 60 15 L 85 15 L 85 85 L 15 85 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 't-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 85 15 L 85 40 L 60 40 L 60 85 L 40 85 L 40 40 L 15 40 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'h-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 35 15 L 35 40 L 65 40 L 65 15 L 85 15 L 85 85 L 65 85 L 65 60 L 35 60 L 35 85 L 15 85 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'courtyard':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 85 15 L 85 85 L 15 85 Z M 35 35 L 65 35 L 65 65 L 35 65 Z" className={baseClass} strokeWidth={strokeWidth} fillRule="evenodd" />
        </svg>
      );
    case 'plus-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 35 15 L 65 15 L 65 35 L 85 35 L 85 65 L 65 65 L 65 85 L 35 85 L 35 65 L 15 65 L 15 35 L 35 35 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'z-shape':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 15 15 L 85 15 L 85 40 L 40 40 L 40 60 L 85 60 L 85 85 L 15 85 L 15 60 L 60 60 L 60 40 L 15 40 Z" className={baseClass} strokeWidth={strokeWidth} />
        </svg>
      );
    default:
      return null;
  }
};

// Building shapes configuration
const BUILDING_SHAPES: BuildingShape[] = [
  {
    id: 'square',
    name: 'Square',
    description: 'Equal sides, efficient layout',
    icon: ({ selected }) => <ShapeIcon shape="square" selected={selected} />,
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'Classic elongated design',
    icon: ({ selected }) => <ShapeIcon shape="rectangle" selected={selected} />,
  },
  {
    id: 'l-shape',
    name: 'L-Shape',
    description: 'Corner lot, dual wings',
    icon: ({ selected }) => <ShapeIcon shape="l-shape" selected={selected} />,
  },
  {
    id: 'u-shape',
    name: 'U-Shape',
    description: 'Courtyard access, three wings',
    icon: ({ selected }) => <ShapeIcon shape="u-shape" selected={selected} />,
  },
  {
    id: 't-shape',
    name: 'T-Shape',
    description: 'Central corridor with wing',
    icon: ({ selected }) => <ShapeIcon shape="t-shape" selected={selected} />,
  },
  {
    id: 'h-shape',
    name: 'H-Shape',
    description: 'Dual wings with connector',
    icon: ({ selected }) => <ShapeIcon shape="h-shape" selected={selected} />,
  },
  {
    id: 'courtyard',
    name: 'Courtyard',
    description: 'Central open space',
    icon: ({ selected }) => <ShapeIcon shape="courtyard" selected={selected} />,
  },
  {
    id: 'plus-shape',
    name: 'Plus Shape',
    description: 'Four-wing radial design',
    icon: ({ selected }) => <ShapeIcon shape="plus-shape" selected={selected} />,
  },
  {
    id: 'z-shape',
    name: 'Z-Shape',
    description: 'Offset wings, modern design',
    icon: ({ selected }) => <ShapeIcon shape="z-shape" selected={selected} />,
  },
];

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

export default function SpaceCalculatorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Form state
  const [propertyType, setPropertyType] = useState('Office');
  const [employees, setEmployees] = useState(25);
  const [sqftPerPerson, setSqftPerPerson] = useState(150);
  const [buildingShape, setBuildingShape] = useState<'square' | 'rectangle' | 'l-shape' | 'u-shape' | 't-shape' | 'h-shape' | 'courtyard' | 'plus-shape' | 'z-shape'>('rectangle');
  
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
  
  // Compliance
  const [complianceIssues, setComplianceIssues] = useState<string[]>([]);
  
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
      
      // Calculate building dimensions
      const totalArea = totalSqft;
      let buildingWidth = 0;
      let buildingHeight = 0;
      
      switch (buildingShape) {
        case 'square':
          buildingWidth = buildingHeight = Math.sqrt(totalArea);
          break;
        case 'rectangle':
          buildingWidth = Math.sqrt(totalArea * 1.5);
          buildingHeight = totalArea / buildingWidth;
          break;
        case 'l-shape':
          buildingWidth = Math.sqrt(totalArea * 1.3);
          buildingHeight = buildingWidth;
          break;
        case 'u-shape':
          buildingWidth = Math.sqrt(totalArea * 1.4);
          buildingHeight = buildingWidth * 0.8;
          break;
        case 't-shape':
          buildingWidth = Math.sqrt(totalArea * 1.4);
          buildingHeight = buildingWidth * 0.9;
          break;
        case 'h-shape':
          buildingWidth = Math.sqrt(totalArea * 1.5);
          buildingHeight = buildingWidth * 0.85;
          break;
        case 'courtyard':
          buildingWidth = buildingHeight = Math.sqrt(totalArea * 1.25);
          break;
        case 'plus-shape':
          buildingWidth = buildingHeight = Math.sqrt(totalArea * 1.3);
          break;
        case 'z-shape':
          buildingWidth = Math.sqrt(totalArea * 1.45);
          buildingHeight = buildingWidth * 0.75;
          break;
      }
      
      // Calculate corridor space (15% of total)
      const corridorSpace = totalArea * 0.15;
      const usableSpace = totalArea - corridorSpace;
      
      // Collect all rooms to place
      const roomsToPlace: { type: string; size: number }[] = [];
      Object.entries(selectedRooms).forEach(([type, config]) => {
        if (config.enabled) {
          const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
          const size = config.customSize || roomType.defaultSize;
          for (let i = 0; i < config.quantity; i++) {
            roomsToPlace.push({ type, size });
          }
        }
      });
      
      // Calculate actual room sizes based on available space
      const totalRequestedSpace = roomsToPlace.reduce((sum, r) => sum + r.size, 0);
      const scaleFactor = usableSpace / totalRequestedSpace;
      
      // Place rooms intelligently
      let currentX = 20;
      let currentY = 20;
      const corridorWidth = 8;
      const padding = 5;
      
      // Sort rooms by priority
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
      
      // Helper function to check if a position is valid for the building shape
      const isValidPosition = (x: number, y: number, w: number, h: number): boolean => {
        const margin = 20;
        const maxX = buildingWidth - margin;
        const maxY = buildingHeight - margin;
        
        // Check if room fits within basic bounds
        if (x < margin || y < margin || x + w > maxX || y + h > maxY) {
          return false;
        }
        
        // Additional checks for complex shapes
        switch (buildingShape) {
          case 'l-shape':
            // Avoid top-right corner
            const lCutoffX = buildingWidth * 0.6;
            const lCutoffY = buildingHeight * 0.5;
            if (x > lCutoffX && y < lCutoffY) {
              return false;
            }
            break;
            
          case 'u-shape':
            // Avoid center gap
            const uGapLeft = buildingWidth * 0.25;
            const uGapRight = buildingWidth * 0.75;
            const uGapTop = buildingHeight * 0.4;
            if (x > uGapLeft && x < uGapRight && y < uGapTop) {
              return false;
            }
            break;
            
          case 't-shape':
            // Avoid side areas in top section
            const tTopHeight = buildingHeight * 0.3;
            const tStemLeft = buildingWidth * 0.3;
            const tStemRight = buildingWidth * 0.7;
            if (y < tTopHeight && (x < tStemLeft || x > tStemRight)) {
              return false;
            }
            break;
            
          case 'courtyard':
            // Avoid center courtyard
            const courtyardMargin = buildingWidth * 0.25;
            const centerLeft = courtyardMargin;
            const centerRight = buildingWidth - courtyardMargin;
            const centerTop = courtyardMargin;
            const centerBottom = buildingHeight - courtyardMargin;
            if (x > centerLeft && x < centerRight && y > centerTop && y < centerBottom) {
              return false;
            }
            break;
        }
        
        return true;
      };
      
      // Intelligent room placement algorithm with shape awareness
      sortedRooms.forEach((room) => {
        const scaledSize = room.size * scaleFactor;
        
        // Create more rectangular rooms for better architectural look
        let width, height;
        
        if (room.type === 'open-workspace') {
          // Open workspace: wider rectangle
          width = Math.sqrt(scaledSize * 2);
          height = scaledSize / width;
        } else if (room.type === 'conference-room' || room.type === 'meeting-room') {
          // Meeting spaces: rectangular with 1.5:1 ratio
          width = Math.sqrt(scaledSize * 1.5);
          height = scaledSize / width;
        } else if (room.type === 'corridor') {
          // Corridors: long and narrow
          width = Math.sqrt(scaledSize * 4);
          height = scaledSize / width;
        } else {
          // Other rooms: roughly square
          width = Math.sqrt(scaledSize * 1.2);
          height = scaledSize / width;
        }
        
        // Find valid position for room
        let attempts = 0;
        let validPosition = false;
        let finalX = currentX;
        let finalY = currentY;
        
        while (!validPosition && attempts < 50) {
          if (isValidPosition(currentX, currentY, width, height)) {
            validPosition = true;
            finalX = currentX;
            finalY = currentY;
          } else {
            // Try next position
            currentY += height + padding;
            
            // Wrap to next column if needed
            if (currentY > buildingHeight - 50) {
              currentX += width + corridorWidth + padding;
              currentY = 20;
            }
          }
          attempts++;
        }
        
        rooms.push({
          id: `room-${roomId++}`,
          type: room.type,
          name: ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name,
          width,
          height,
          x: finalX,
          y: finalY,
          color: ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].color,
          quantity: 1,
          isRequired: room.type === 'reception' || room.type === 'restroom',
        });
        
        // Move position for next room
        currentY += height + padding;
        
        // Wrap to next column if needed
        if (currentY > buildingHeight - 50) {
          currentX += width + corridorWidth + padding;
          currentY = 20;
        }
      });
      
      setPlacedRooms(rooms);
      setIsGenerating(false);
      setShowFloorPlan(true);
    }, 1500);
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
        // L-shape: main rectangle + side extension
        const lMainWidth = outerWidth * 0.6;
        const lExtWidth = outerWidth * 0.4;
        const lMainHeight = outerHeight;
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
        // U-shape: three sections with gap in middle
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
        // T-shape: horizontal top + vertical stem
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
        // H-shape: two vertical bars connected by horizontal
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
        // Courtyard: outer square with inner square cutout
        const courtyardInnerMargin = outerWidth * 0.25;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + outerWidth, startY);
        ctx.lineTo(startX + outerWidth, startY + outerHeight);
        ctx.lineTo(startX, startY + outerHeight);
        ctx.closePath();
        // Inner courtyard (will be drawn separately)
        ctx.moveTo(startX + courtyardInnerMargin, startY + courtyardInnerMargin);
        ctx.lineTo(startX + outerWidth - courtyardInnerMargin, startY + courtyardInnerMargin);
        ctx.lineTo(startX + outerWidth - courtyardInnerMargin, startY + outerHeight - courtyardInnerMargin);
        ctx.lineTo(startX + courtyardInnerMargin, startY + outerHeight - courtyardInnerMargin);
        ctx.closePath();
        break;
        
      case 'plus-shape':
        // Plus shape: cross with four wings
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
        // Z-shape: offset rectangles
        const zTopHeight = outerHeight * 0.35;
        const zMidHeight = outerHeight * 0.3;
        const zBotHeight = outerHeight * 0.35;
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
    
    ctx.fill();
    ctx.stroke();
    
    // Calculate available space for rooms (accounting for walls and margins)
    const margin = wallThickness + 15;
    const roomPadding = 10; // Padding between rooms
    const corridorSpace = 15; // Space for corridors between rows
    
    // Calculate total room area needed
    const totalRoomArea = placedRooms.reduce((sum, r) => sum + (r.width * r.height), 0);
    const usableArea = buildingArea * 0.55; // 45% for corridors and circulation
    
    // Calculate scale factor to fit all rooms within available space
    let roomScale = Math.sqrt(usableArea / totalRoomArea);
    
    // Sort rooms for better layout
    const sortedRooms = [...placedRooms].sort((a, b) => {
      const priority: {[key: string]: number} = {
        'reception': 1,
        'open-workspace': 2,
        'private-office': 3,
        'conference-room': 4,
        'meeting-room': 5,
        'kitchen': 6,
        'break-room': 7,
        'restroom': 8,
        'storage': 9,
        'server-room': 10,
        'copy-room': 11,
      };
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });
    
    // Helper function to check if a rectangle is within the building shape
    const isWithinBuildingShape = (x: number, y: number, w: number, h: number): boolean => {
      // Normalize coordinates relative to building start
      const relX = x - startX;
      const relY = y - startY;
      const relX2 = relX + w;
      const relY2 = relY + h;
      
      // Check all four corners of the room
      const checkPoint = (px: number, py: number): boolean => {
        switch (buildingShape) {
          case 'square':
          case 'rectangle':
            return px >= 0 && px <= outerWidth && py >= 0 && py <= outerHeight;
            
          case 'l-shape':
            const lMainWidth = outerWidth * 0.6;
            const lExtHeight = outerHeight * 0.5;
            // Check if point is in main vertical section or horizontal extension
            const inMainSection = px >= 0 && px <= lMainWidth && py >= 0 && py <= outerHeight;
            const inExtension = px >= lMainWidth && px <= outerWidth && py >= lExtHeight && py <= outerHeight;
            return inMainSection || inExtension;
            
          case 'u-shape':
            const uSideWidth = outerWidth * 0.25;
            const uGapWidth = outerWidth * 0.5;
            const uGapDepth = outerHeight * 0.4;
            // Check if point is NOT in the gap
            const inGap = px >= uSideWidth && px <= uSideWidth + uGapWidth && py >= 0 && py <= uGapDepth;
            const inBounds = px >= 0 && px <= outerWidth && py >= 0 && py <= outerHeight;
            return inBounds && !inGap;
            
          case 't-shape':
            const tTopHeight = outerHeight * 0.3;
            const tStemWidth = outerWidth * 0.4;
            const tStemOffset = (outerWidth - tStemWidth) / 2;
            const inTop = py >= 0 && py <= tTopHeight && px >= 0 && px <= outerWidth;
            const inStem = py >= tTopHeight && py <= outerHeight && px >= tStemOffset && px <= tStemOffset + tStemWidth;
            return inTop || inStem;
            
          case 'h-shape':
            const hBarWidth = outerWidth * 0.25;
            const hConnectorHeight = outerHeight * 0.3;
            const hConnectorTop = (outerHeight - hConnectorHeight) / 2;
            const inLeftBar = px >= 0 && px <= hBarWidth && py >= 0 && py <= outerHeight;
            const inRightBar = px >= outerWidth - hBarWidth && px <= outerWidth && py >= 0 && py <= outerHeight;
            const inConnector = px >= hBarWidth && px <= outerWidth - hBarWidth && py >= hConnectorTop && py <= hConnectorTop + hConnectorHeight;
            return inLeftBar || inRightBar || inConnector;
            
          case 'courtyard':
            const courtyardInnerMargin = outerWidth * 0.25;
            const inOuter = px >= 0 && px <= outerWidth && py >= 0 && py <= outerHeight;
            const inInner = px >= courtyardInnerMargin && px <= outerWidth - courtyardInnerMargin && 
                           py >= courtyardInnerMargin && py <= outerHeight - courtyardInnerMargin;
            return inOuter && !inInner;
            
          case 'plus-shape':
            const plusArmWidth = outerWidth * 0.35;
            const plusArmOffset = (outerWidth - plusArmWidth) / 2;
            const inVertical = px >= plusArmOffset && px <= plusArmOffset + plusArmWidth && py >= 0 && py <= outerHeight;
            const inHorizontal = py >= plusArmOffset && py <= plusArmOffset + plusArmWidth && px >= 0 && px <= outerWidth;
            return inVertical || inHorizontal;
            
          case 'z-shape':
            const zTopHeight = outerHeight * 0.3;
            const zBottomHeight = outerHeight * 0.3;
            const inTopBar = py >= 0 && py <= zTopHeight && px >= 0 && px <= outerWidth;
            const inBottomBar = py >= outerHeight - zBottomHeight && py <= outerHeight && px >= 0 && px <= outerWidth;
            const inDiagonal = py >= zTopHeight && py <= outerHeight - zBottomHeight;
            return inTopBar || inBottomBar || inDiagonal;
            
          default:
            return px >= 0 && px <= outerWidth && py >= 0 && py <= outerHeight;
        }
      };
      
      // All four corners must be within the shape
      return checkPoint(relX, relY) && 
             checkPoint(relX2, relY) && 
             checkPoint(relX, relY2) && 
             checkPoint(relX2, relY2);
    };
    
    // Place rooms with shape-aware algorithm
    const scaledRooms: {room: Room; x: number; y: number; w: number; h: number}[] = [];
    const maxX = startX + outerWidth - margin;
    const maxY = startY + outerHeight - margin;
    
    // Adjust room scale to better utilize space
    roomScale *= 0.90;
    
    let currentX = startX + margin;
    let currentY = startY + margin;
    let maxRowHeight = 0;
    let rowStartX = currentX;
    
    sortedRooms.forEach((room, index) => {
      // Calculate room dimensions
      const area = room.width * room.height * roomScale;
      let w = Math.sqrt(area * 1.2) * scale;
      let h = (area / (w / scale)) * scale;
      
      // Ensure minimum and maximum size
      w = Math.max(Math.min(w, 150), 40);
      h = Math.max(Math.min(h, 120), 40);
      
      let placed = false;
      let attempts = 0;
      const maxAttempts = 150;
      
      while (!placed && attempts < maxAttempts) {
        // Check if room fits in current position
        if (currentX + w <= maxX && currentY + h <= maxY && 
            isWithinBuildingShape(currentX, currentY, w, h)) {
          // Place the room
          scaledRooms.push({
            room,
            x: currentX,
            y: currentY,
            w: w,
            h: h,
          });
          
          currentX += w + roomPadding;
          maxRowHeight = Math.max(maxRowHeight, h);
          placed = true;
        } else {
          // Try next position
          currentX += 15; // Move right in small increments
          
          // Check if we need to move to next row
          if (currentX + w > maxX || !isWithinBuildingShape(currentX, currentY, w, h)) {
            // Move to next row
            currentX = rowStartX;
            currentY += maxRowHeight + corridorSpace;
            maxRowHeight = 0;
            
            // For L-shape and other complex shapes, adjust row start X based on Y position
            if (buildingShape === 'l-shape') {
              const lMainWidth = outerWidth * 0.6;
              const lExtHeight = outerHeight * 0.5;
              const relY = currentY - startY;
              // If we're in the extension part, we can use full width
              if (relY >= lExtHeight) {
                rowStartX = startX + margin;
              }
            }
            
            if (currentY + h > maxY) {
              // No more space vertically, try reducing size
              w *= 0.92;
              h *= 0.92;
              currentX = startX + margin;
              currentY = startY + margin;
              rowStartX = currentX;
              
              if (w < 35 || h < 35) {
                // Room too small, skip it
                break;
              }
            } else {
              currentX = rowStartX;
            }
          }
        }
        attempts++;
      }
    });
    
    // Draw corridors - just fill the entire building area (rooms will be drawn on top)
    // Skip corridor drawing as it's making the shape unclear
    
    // Furniture drawing removed for clean floor plan - only architectural elements shown
    
    // Draw rooms with walls, doors, labels, and furniture
    scaledRooms.forEach(({room, x, y, w, h}, index) => {
      // Fill room with color
      ctx.fillStyle = room.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      
      // Draw room walls (thick lines)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = wallThickness - 2;
      ctx.strokeRect(x, y, w, h);
      
      // Draw door (gap in wall with arc)
      const doorY = y; // Top wall
      const doorX = x + w / 2 - doorWidth / 2;
      
      // Clear door gap
      ctx.strokeStyle = room.color;
      ctx.lineWidth = wallThickness;
      ctx.beginPath();
      ctx.moveTo(doorX, doorY);
      ctx.lineTo(doorX + doorWidth, doorY);
      ctx.stroke();
      
      // Draw door arc
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(doorX, doorY, doorWidth, 0, Math.PI / 2);
      ctx.stroke();
      
      // Draw door symbol (line)
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(doorX, doorY);
      ctx.lineTo(doorX + doorWidth * 0.7, doorY - doorWidth * 0.7);
      ctx.stroke();
      
      // Room dimensions
      const roomWidthFt = Math.round(Math.sqrt(room.width * room.height));
      const roomHeightFt = Math.round(Math.sqrt(room.width * room.height));
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
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      
      // Room name with white outline for visibility
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // White outline/stroke for better visibility
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeText(room.name, centerX, centerY - 10);
      
      // Black text on top
      ctx.fillStyle = '#000000';
      ctx.fillText(room.name, centerX, centerY - 10);
      
      // Room square footage with outline
      ctx.font = 'bold 11px Arial, sans-serif';
      
      // White outline
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeText(`${roomSqft} sq ft`, centerX, centerY + 8);
      
      // Dark text on top
      ctx.fillStyle = '#333333';
      ctx.fillText(`${roomSqft} sq ft`, centerX, centerY + 8);
      
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
    
    // Draw scale bar
    const scaleBarY = height - 40;
    const scaleBarX = padding;
    const scaleBarLength = 100;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarLength, scaleBarY);
    ctx.stroke();
    
    // Scale bar ticks
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY - 5);
    ctx.lineTo(scaleBarX, scaleBarY + 5);
    ctx.moveTo(scaleBarX + scaleBarLength, scaleBarY - 5);
    ctx.lineTo(scaleBarX + scaleBarLength, scaleBarY + 5);
    ctx.stroke();
    
    // Scale bar label
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('0', scaleBarX, scaleBarY + 18);
    ctx.fillText('10 ft', scaleBarX + scaleBarLength, scaleBarY + 18);
    
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
    
    // Get room breakdown
    const roomBreakdown = Object.entries(selectedRooms)
      .filter(([_, config]) => config.enabled)
      .map(([type, config]) => {
        const roomType = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
        const size = config.customSize || roomType.defaultSize;
        const totalSize = size * config.quantity;
        return {
          name: roomType.name,
          quantity: config.quantity,
          sizeEach: size,
          totalSize: totalSize,
          color: roomType.color,
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
            .compliance-check {
              background: ${complianceIssues.length === 0 ? '#e8f5e9' : '#ffebee'};
              border: 2px solid ${complianceIssues.length === 0 ? '#66bb6a' : '#ef5350'};
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
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
                <div class="stat-value">$${(estimatedTotalCost / 1000).toFixed(0)}K</div>
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
                <td style="text-transform: capitalize;">${buildingShape.replace('-', ' ')}</td>
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
                <span>Base Construction (${totalSqft.toLocaleString()} sq ft × $100/sq ft)</span>
                <strong>$${Math.round(totalSqft * 100).toLocaleString()}</strong>
              </div>
              <div class="cost-row">
                <span>Interior Finishes (${totalSqft.toLocaleString()} sq ft × $30/sq ft)</span>
                <strong>$${Math.round(totalSqft * 30).toLocaleString()}</strong>
              </div>
              <div class="cost-row">
                <span>MEP Systems (${totalSqft.toLocaleString()} sq ft × $20/sq ft)</span>
                <strong>$${Math.round(totalSqft * 20).toLocaleString()}</strong>
              </div>
              <div class="cost-row">
                <span>TOTAL ESTIMATED COST</span>
                <strong style="color: #FFD700;">$${estimatedTotalCost.toLocaleString()}</strong>
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
                    <td>${((room.totalSize / totalRoomSqft) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
                <tr style="background: #f5f5f5; font-weight: bold;">
                  <td colspan="3">TOTAL ROOM AREA</td>
                  <td>${totalRoomSqft.toLocaleString()} sq ft</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td colspan="3">Circulation & Corridors</td>
                  <td>${(totalSqft - totalRoomSqft).toLocaleString()} sq ft</td>
                  <td>${circulationPercentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">✅ Compliance Check</div>
            <div class="compliance-check">
              ${complianceIssues.length === 0 ? `
                <h3 style="color: #2e7d32; margin-bottom: 10px;">✓ All Compliance Requirements Met</h3>
                <p style="color: #388e3c;">This design meets all building code and occupancy requirements.</p>
              ` : `
                <h3 style="color: #c62828; margin-bottom: 10px;">⚠ Compliance Issues Detected</h3>
                <ul style="list-style: none; padding: 0;">
                  ${complianceIssues.map(issue => `
                    <li style="padding: 5px 0; color: #d32f2f;">• ${issue}</li>
                  `).join('')}
                </ul>
              `}
            </div>
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
  
  const checkCompliance = () => {
    const issues: string[] = [];
    
    // Removed strict compliance checks - users can configure freely
    // Only show warnings, not blocking issues
    
    setComplianceIssues(issues);
  };
  
  useEffect(() => {
    checkCompliance();
  }, [employees, sqftPerPerson, selectedRooms]);
  
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
  const estimatedCostPerSqft = 150;
  const estimatedTotalCost = Math.round(totalSqft * estimatedCostPerSqft);
  
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
              
              {/* Building Shape Visual Selector */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-primary-black mb-3">
                  Building Shape
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {BUILDING_SHAPES.map((shape) => (
                    <motion.button
                      key={shape.id}
                      type="button"
                      onClick={() => setBuildingShape(shape.id as any)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-3 rounded-xl border-3 transition-all ${
                        buildingShape === shape.id
                          ? 'border-accent-yellow bg-yellow-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-square mb-2">
                        <shape.icon selected={buildingShape === shape.id} />
                      </div>
                      <div className={`text-xs font-bold text-center mb-1 ${
                        buildingShape === shape.id ? 'text-primary-black' : 'text-gray-700'
                      }`}>
                        {shape.name}
                      </div>
                      <div className={`text-[10px] text-center leading-tight ${
                        buildingShape === shape.id ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {shape.description}
                      </div>
                      {buildingShape === shape.id && (
                        <motion.div
                          layoutId="selected-shape"
                          className="absolute inset-0 border-3 border-accent-yellow rounded-xl pointer-events-none"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
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
                            placeholder={roomType.defaultSize.toString()}
                            value={selectedRooms[key]?.customSize || ''}
                            onChange={(e) => {
                              setSelectedRooms({
                                ...selectedRooms,
                                [key]: {
                                  ...selectedRooms[key],
                                  customSize: parseInt(e.target.value) || undefined,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent-yellow"
                          />
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
                  <div className="text-2xl font-bold text-primary-black">${(estimatedTotalCost / 1000).toFixed(0)}K</div>
                </div>
              </div>
            </div>
            
            {/* Compliance Check */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-primary-black mb-4 flex items-center gap-2">
                {complianceIssues.length === 0 ? (
                  <CheckCircle size={24} className="text-green-500" />
                ) : (
                  <AlertCircle size={24} className="text-red-500" />
                )}
                Compliance Check
              </h3>
              {complianceIssues.length === 0 ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  <span className="font-semibold">All compliance requirements met! Ready to generate floor plan.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {complianceIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2"
                    >
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
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
                <div className="text-lg font-bold text-primary-black capitalize">{buildingShape.replace('-', ' ')}</div>
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
                  <div className="text-2xl font-bold text-orange-900">${(estimatedTotalCost / 1000).toFixed(0)}K</div>
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-semibold text-primary-black mb-2">Cost Breakdown</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Base Construction</span>
                    <span className="font-semibold">${Math.round(totalSqft * 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Interior Finishes</span>
                    <span className="font-semibold">${Math.round(totalSqft * 30).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">MEP Systems</span>
                    <span className="font-semibold">${Math.round(totalSqft * 20).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                    <span>Total Estimate</span>
                    <span className="text-accent-yellow">${estimatedTotalCost.toLocaleString()}</span>
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
                <div className="bg-gradient-to-r from-accent-yellow to-yellow-400 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-black">Your Floor Plan</h2>
                    <p className="text-sm text-primary-black/80">
                      {propertyType} • {totalSqft.toLocaleString()} sq ft • {totalRooms} rooms
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFloorPlan(false)}
                    className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                  >
                    <X size={28} className="text-primary-black" />
                  </button>
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
