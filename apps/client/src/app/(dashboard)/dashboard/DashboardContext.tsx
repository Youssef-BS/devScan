"use client"

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
    path: string;
    changePath: (path: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [currentPath, setCurrentPath] = useState<string>("repositories");

    const changePath = (path: string) => {
        setCurrentPath(path);
    };

    return (
        <DashboardContext.Provider value={{ path: currentPath, changePath }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within DashboardProvider");
    }
    return context;
}
