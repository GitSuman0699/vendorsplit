'use client';

import { ReactNode } from 'react';
import { useDashboard } from './DashboardContext';

export function DashboardTransitionWrapper({ 
  serverEventId, 
  children, 
  fallback 
}: { 
  serverEventId: string, 
  children: ReactNode, 
  fallback: ReactNode 
}) {
  const { optimisticEventId } = useDashboard();
  
  if (optimisticEventId !== serverEventId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
