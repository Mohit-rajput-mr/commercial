import Navigation from '@/components/Navigation';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="h-[68px] w-full"></div>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading search results...</p>
        </div>
      </div>
    </div>
  );
}















