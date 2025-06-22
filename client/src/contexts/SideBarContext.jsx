import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';

const SideBarContext = createContext();

export function SideBarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close sidebar when route changes (but not on search params change)
    useEffect(() => {
        const handleRouteChange = () => {
            // Only close sidebar if the pathname changes, not on search params change
            if (isOpen) {
                const currentPath = location.pathname + location.search;
                const lastPath = sessionStorage.getItem('lastPath') || '';
                
                if (lastPath && lastPath.split('?')[0] !== location.pathname) {
                    setIsOpen(false);
                }
                
                sessionStorage.setItem('lastPath', currentPath);
            }
        };
        
        handleRouteChange();
        
        return () => {
            // Cleanup if needed
        };
    }, [location.pathname, isOpen]); // Only re-run when pathname or isOpen changes

    return (
        <SideBarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSideBar() {
    return useContext(SideBarContext);
}