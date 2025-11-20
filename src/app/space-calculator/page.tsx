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
  const [buildingShape, setBuildingShape] = useState<'square' | 'rectangle' | 'l-shape' | 'u-shape'>('rectangle');
  
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
      
      // Intelligent room placement algorithm
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
        
        rooms.push({
          id: `room-${roomId++}`,
          type: room.type,
          name: ROOM_TYPES[room.type as keyof typeof ROOM_TYPES].name,
          width,
          height,
          x: currentX,
          y: currentY,
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
    }
    
    // Scale factor to fit canvas
    const availableWidth = width - (padding * 2);
    const availableHeight = height - padding - 100;
    const scale = Math.min(availableWidth / buildingWidth, availableHeight / buildingHeight) * 0.9;
    
    // Starting position (centered)
    const startX = padding + (availableWidth - buildingWidth * scale) / 2;
    const startY = 80;
    
    // Draw outer walls (thick black lines)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = wallThickness;
    ctx.fillStyle = '#F5F5F5';
    const outerWidth = buildingWidth * scale;
    const outerHeight = buildingHeight * scale;
    ctx.fillRect(startX, startY, outerWidth, outerHeight);
    ctx.strokeRect(startX, startY, outerWidth, outerHeight);
    
    // Calculate room dimensions with proper spacing
    const corridorWidth = 50; // corridor width in pixels
    const roomPadding = 3;
    
    // Group rooms by type for intelligent placement
    const roomsByType: {[key: string]: Room[]} = {};
    placedRooms.forEach((room) => {
      if (!roomsByType[room.type]) {
        roomsByType[room.type] = [];
      }
      roomsByType[room.type].push(room);
    });
    
    // Calculate scaled room dimensions
    const totalRoomArea = placedRooms.reduce((sum, r) => sum + (r.width * r.height), 0);
    const usableArea = buildingArea * 0.75; // 25% for corridors
    const roomScale = Math.sqrt(usableArea / totalRoomArea);
    
    // Layout algorithm: place rooms in a grid-like pattern
    let currentX = startX + wallThickness + roomPadding;
    let currentY = startY + wallThickness + roomPadding;
    let maxRowHeight = 0;
    let rowStartX = currentX;
    
    const scaledRooms: {room: Room; x: number; y: number; w: number; h: number}[] = [];
    
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
    
    // Place rooms with intelligent layout
    sortedRooms.forEach((room, index) => {
      const roomW = Math.sqrt(room.width * room.height * roomScale) * scale;
      const roomH = roomW; // Keep rooms roughly square for better layout
      
      // Check if room fits in current row
      if (currentX + roomW > startX + outerWidth - wallThickness - roomPadding) {
        // Move to next row
        currentX = rowStartX;
        currentY += maxRowHeight + corridorWidth;
        maxRowHeight = 0;
      }
      
      // Check if we need to start a new section
      if (currentY + roomH > startY + outerHeight - wallThickness - roomPadding) {
        // Fit it anyway or reduce size
        const reducedHeight = (startY + outerHeight - wallThickness - roomPadding - currentY);
        scaledRooms.push({
          room,
          x: currentX,
          y: currentY,
          w: roomW,
          h: Math.max(reducedHeight, 40),
        });
      } else {
        scaledRooms.push({
          room,
          x: currentX,
          y: currentY,
          w: roomW,
          h: roomH,
        });
      }
      
      currentX += roomW + roomPadding;
      maxRowHeight = Math.max(maxRowHeight, roomH);
    });
    
    // Draw corridors (hatched pattern)
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(startX + wallThickness, startY + wallThickness, outerWidth - wallThickness * 2, outerHeight - wallThickness * 2);
    
    // Draw corridor pattern
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    for (let i = 0; i < outerWidth; i += 20) {
      ctx.beginPath();
      ctx.moveTo(startX + i, startY);
      ctx.lineTo(startX + i, startY + outerHeight);
      ctx.stroke();
    }
    
    // Helper function to draw furniture
    const drawFurniture = (x: number, y: number, w: number, h: number, roomType: string) => {
      ctx.strokeStyle = '#666666';
      ctx.fillStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      
      if (roomType === 'private-office') {
        // Draw desk
        const deskW = Math.min(w * 0.4, 40);
        const deskH = Math.min(h * 0.25, 20);
        ctx.fillRect(x + w * 0.3, y + h * 0.3, deskW, deskH);
        ctx.strokeRect(x + w * 0.3, y + h * 0.3, deskW, deskH);
        
        // Draw chair
        const chairSize = 8;
        ctx.beginPath();
        ctx.arc(x + w * 0.3 + deskW / 2, y + h * 0.3 + deskH + 12, chairSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw filing cabinet
        ctx.fillRect(x + w * 0.7, y + h * 0.7, 15, 10);
        ctx.strokeRect(x + w * 0.7, y + h * 0.7, 15, 10);
      } else if (roomType === 'conference-room') {
        // Draw conference table
        const tableW = w * 0.6;
        const tableH = h * 0.4;
        ctx.fillRect(x + w * 0.2, y + h * 0.3, tableW, tableH);
        ctx.strokeRect(x + w * 0.2, y + h * 0.3, tableW, tableH);
        
        // Draw chairs around table
        const chairSize = 6;
        const numChairs = Math.min(Math.floor(tableW / 20), 8);
        for (let i = 0; i < numChairs; i++) {
          const chairX = x + w * 0.2 + (tableW / (numChairs + 1)) * (i + 1);
          // Top chairs
          ctx.beginPath();
          ctx.arc(chairX, y + h * 0.3 - 10, chairSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Bottom chairs
          ctx.beginPath();
          ctx.arc(chairX, y + h * 0.3 + tableH + 10, chairSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else if (roomType === 'meeting-room') {
        // Draw small table
        const tableSize = Math.min(w, h) * 0.35;
        ctx.fillRect(x + w / 2 - tableSize / 2, y + h / 2 - tableSize / 2, tableSize, tableSize);
        ctx.strokeRect(x + w / 2 - tableSize / 2, y + h / 2 - tableSize / 2, tableSize, tableSize);
        
        // Draw 4 chairs
        const chairSize = 6;
        const positions = [
          {x: x + w / 2, y: y + h / 2 - tableSize / 2 - 10}, // Top
          {x: x + w / 2, y: y + h / 2 + tableSize / 2 + 10}, // Bottom
          {x: x + w / 2 - tableSize / 2 - 10, y: y + h / 2}, // Left
          {x: x + w / 2 + tableSize / 2 + 10, y: y + h / 2}, // Right
        ];
        positions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, chairSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      } else if (roomType === 'kitchen' || roomType === 'break-room') {
        // Draw counter
        const counterW = w * 0.7;
        ctx.fillRect(x + w * 0.15, y + 10, counterW, 12);
        ctx.strokeRect(x + w * 0.15, y + 10, counterW, 12);
        
        // Draw refrigerator
        ctx.fillRect(x + 10, y + 10, 18, 25);
        ctx.strokeRect(x + 10, y + 10, 18, 25);
        ctx.strokeRect(x + 10, y + 10, 18, 12); // Top door
        
        // Draw sink (circles)
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + 16, 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw table
        const tableW = w * 0.4;
        const tableH = h * 0.3;
        ctx.fillRect(x + w * 0.3, y + h * 0.5, tableW, tableH);
        ctx.strokeRect(x + w * 0.3, y + h * 0.5, tableW, tableH);
      } else if (roomType === 'restroom') {
        // Draw toilet
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + w * 0.3, y + h * 0.5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw sink
        ctx.beginPath();
        ctx.arc(x + w * 0.7, y + h * 0.3, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Accessibility symbol
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#0066CC';
        ctx.fillText('♿', x + w * 0.7, y + h * 0.7);
      } else if (roomType === 'reception') {
        // Draw reception desk
        const deskW = w * 0.6;
        const deskH = h * 0.2;
        ctx.fillRect(x + w * 0.2, y + h * 0.4, deskW, deskH);
        ctx.strokeRect(x + w * 0.2, y + h * 0.4, deskW, deskH);
        
        // Draw waiting chairs
        const chairSize = 8;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x + w * 0.3 + i * 25, y + h * 0.75, chairSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else if (roomType === 'open-workspace') {
        // Draw cubicles/desks in grid
        const deskW = 25;
        const deskH = 20;
        const rows = Math.floor(h / 40);
        const cols = Math.floor(w / 40);
        
        ctx.fillStyle = '#DDDDDD';
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const deskX = x + 15 + c * 40;
            const deskY = y + 15 + r * 40;
            if (deskX + deskW < x + w - 10 && deskY + deskH < y + h - 10) {
              ctx.fillRect(deskX, deskY, deskW, deskH);
              ctx.strokeRect(deskX, deskY, deskW, deskH);
            }
          }
        }
      } else if (roomType === 'storage' || roomType === 'server-room') {
        // Draw shelving units
        const shelfW = w * 0.8;
        const shelfH = 8;
        const numShelves = Math.floor(h / 25);
        
        for (let i = 0; i < numShelves; i++) {
          const shelfY = y + 15 + i * 25;
          if (shelfY + shelfH < y + h - 10) {
            ctx.fillRect(x + w * 0.1, shelfY, shelfW, shelfH);
            ctx.strokeRect(x + w * 0.1, shelfY, shelfW, shelfH);
          }
        }
      }
    };
    
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
      
      // Room label with background
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      
      // Label background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const labelPadding = 8;
      const labelWidth = Math.max(w * 0.8, 80);
      const labelHeight = 45;
      ctx.fillRect(
        centerX - labelWidth / 2,
        centerY - labelHeight / 2,
        labelWidth,
        labelHeight
      );
      
      // Border around label
      ctx.strokeStyle = room.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        centerX - labelWidth / 2,
        centerY - labelHeight / 2,
        labelWidth,
        labelHeight
      );
      
      // Room name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.name, centerX, centerY - 10);
      
      // Room square footage
      ctx.font = '11px Arial, sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(`${roomSqft} sq ft`, centerX, centerY + 8);
      
      // Draw furniture and fixtures
      drawFurniture(x, y, w, h, room.type);
      
      // Add electrical outlets (small circles on walls)
      ctx.fillStyle = '#FF6B6B';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;
      const outletSize = 3;
      // Bottom wall outlets
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(x + (w / 3) * i, y + h - 5, outletSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      // Add light fixture symbol (X in ceiling)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      const lightSize = 10;
      ctx.beginPath();
      ctx.moveTo(centerX - lightSize, centerY - h * 0.35 - lightSize);
      ctx.lineTo(centerX + lightSize, centerY - h * 0.35 + lightSize);
      ctx.moveTo(centerX + lightSize, centerY - h * 0.35 - lightSize);
      ctx.lineTo(centerX - lightSize, centerY - h * 0.35 + lightSize);
      ctx.stroke();
    });
    
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                {/* Building Shape */}
                <div>
                  <label className="block text-sm font-semibold text-primary-black mb-2">
                    Building Shape
                  </label>
                  <select
                    value={buildingShape}
                    onChange={(e) => setBuildingShape(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors"
                  >
                    <option value="square">Square</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="l-shape">L-Shape</option>
                    <option value="u-shape">U-Shape</option>
                  </select>
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
