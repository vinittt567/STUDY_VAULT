import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

interface SidebarProviderProps {
    children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on mobile when clicking outside or on route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true); // Always open on desktop
            } else {
                setIsOpen(false); // Closed by default on mobile
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);
    const open = () => setIsOpen(true);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
            {children}
        </SidebarContext.Provider>
    );
};