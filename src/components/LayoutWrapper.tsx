'use client';

import RouteProgressBar from './RouteProgressBar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteProgressBar />
      {children}
    </>
  );
}

