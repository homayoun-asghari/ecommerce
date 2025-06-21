import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';

const SideBarContext = createContext();

export function SideBarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // // Close sidebar when route changes
    // useEffect(() => {
    //     const handleRouteChange = () => {
    //         setIsOpen(false);
    //     };
        
    //     handleRouteChange(); // Close on initial render and when location changes
        
    //     // Cleanup function in case the component unmounts
    //     return () => {
    //         // Any cleanup if needed
    //     };
    // }, [location]); // Re-run effect when location changes

    return (
        <SideBarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSideBar() {
    return useContext(SideBarContext);
}