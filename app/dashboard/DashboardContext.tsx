'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type DashboardContextType = {
  optimisticEventId: string;
  setOptimisticEventId: (id: string) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ 
  serverEventId, 
  children 
}: { 
  serverEventId: string; 
  children: ReactNode; 
}) {
  const [prevServerId, setPrevServerId] = useState(serverEventId);
  const [optimisticEventId, setOptimisticEventId] = useState(serverEventId);

  // Sync state when the server payload updates the serverEventId
  if (serverEventId !== prevServerId) {
    setPrevServerId(serverEventId);
    setOptimisticEventId(serverEventId);
  }

  return (
    <DashboardContext.Provider value={{ optimisticEventId, setOptimisticEventId }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('Missing DashboardProvider');
  return ctx;
}
