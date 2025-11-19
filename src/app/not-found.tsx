'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black flex items-center justify-center px-5">
      <div className="text-center space-y-8">
        {/* 404 */}
        <h1 className="text-9xl font-extrabold text-accent-yellow">404</h1>
        
        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">Page Not Found</h2>
          <p className="text-xl text-custom-gray max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            The property you&apos;re searching for might have been sold or moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-accent-yellow text-primary-black rounded-xl font-semibold hover:bg-yellow-400 transition-all hover:scale-105"
          >
            <Home size={20} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 border-2 border-accent-yellow text-white rounded-xl font-semibold hover:bg-accent-yellow hover:text-primary-black transition-all"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

