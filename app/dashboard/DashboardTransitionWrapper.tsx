'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

export function DashboardTransitionWrapper({ 
  serverEventId, 
  defaultEventId,
  children, 
  fallback 
}: { 
  serverEventId: string, 
  defaultEventId: string,
  children: ReactNode, 
  fallback: ReactNode 
}) {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get('eventId');
  const expectedEventId = queryEventId || defaultEventId;
  
  // If the client's expected event ID from the URL differs from what the server 
  // currently rendered, it means we are in the middle of a route transition. 
  // We can instantly show the loading skeleton to provide immediate feedback!
  if (expectedEventId !== serverEventId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
