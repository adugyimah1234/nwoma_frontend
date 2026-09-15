/* eslint-disable @typescript-eslint/consistent-type-imports */
// contexts/DashboardContext.tsx
'use client';

import { createContext, useState, ReactNode, useContext } from 'react';

interface DashboardContextType {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeItem, setActiveItem] = useState('Dashboard'); // Default active item

  return (
    <DashboardContext.Provider value={{ activeItem, setActiveItem }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
