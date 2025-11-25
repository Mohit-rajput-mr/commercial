'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ZillowPropertyRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new residential property route
    if (params.zpid) {
      router.replace(`/property/residential/${params.zpid}`);
    }
  }, [params.zpid, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
