import React, { createContext, useContext, useState } from "react";

const SideBarContext = createContext();

export function SideBarProvider({children}){
    const [isOpen, setIsOpen] = useState(false);

    return(
        <SideBarContext.Provider value={{isOpen, setIsOpen}}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSideBar(){
    return useContext(SideBarContext);
}