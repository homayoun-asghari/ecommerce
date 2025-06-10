import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        const storedMode = localStorage.getItem('themeMode');
        const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (storedMode) {
            return storedMode === 'dark' ? false : true; // true = light, false = dark
        } else {
            return !systemMode; // true = light, false = dark
        }
    });


    function handleToggle() {
        setMode(prev => {
            const newMode = !prev;
            localStorage.setItem('themeMode', newMode ? 'light' : 'dark');
            return newMode;
        });
    }

    useEffect(() => {
        const body = document.body;

        // Disable transitions
        body.classList.add("theme-transition");

        // Change theme
        body.setAttribute("data-bs-theme", mode ? "light" : "dark");

        // Re-enable transitions after a tick
        const timeout = setTimeout(() => {
            body.classList.remove("theme-transition");
        }, 0);

        return () => clearTimeout(timeout);
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, handleToggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}