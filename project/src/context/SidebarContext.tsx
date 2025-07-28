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

    // Handle sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                // On desktop, sidebar is always visible, so we don't need to track "open" state
                // The CSS handles the desktop layout automatically
            } else {
                // On mobile, ensure sidebar is closed by default
                setIsOpen(false);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggle = () => {
        // Only toggle on mobile devices
        if (window.innerWidth < 1024) {
            setIsOpen(!isOpen);
        }
    };
    const close = () => setIsOpen(false);
    const open = () => setIsOpen(true);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
            {children}
        </SidebarContext.Provider>
    );
};