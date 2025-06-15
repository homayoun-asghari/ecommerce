import React, { useState, useEffect, useRef } from 'react';
import { useSideBar } from "../contexts/SideBarContext";
import "../styles/Categories.css";
import FilterItems from "./FilterItems";

const FilterSideBar = ({ className = '' }) => {
    const { isOpen, setIsOpen } = useSideBar();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const dropdownRef = useRef(null);
    const isFirstRender = useRef(true);

    // Sync with sidebar state
    useEffect(() => {
        setIsDropdownOpen(isOpen);
    }, [isOpen]);

    // Handle dropdown toggle
    const handleToggle = (e) => {
        e.stopPropagation();
        const newState = !isDropdownOpen;
        setIsDropdownOpen(newState);
        setIsOpen(newState);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                if (isOpen) setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    // Handle transitions
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }


        setIsTransitioning(true);
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 350);

        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <div 
            className={`set category-wrapper ${isTransitioning ? 'sidebar-transitioning' : ''} ${className}`}
            ref={dropdownRef}
        >
            <div className="accordion">
                <div className="accordion-item">
                    <button 
                        id="all" 
                        className="accordion-button" 
                        type="button"
                        onClick={handleToggle}
                        aria-expanded={isDropdownOpen}
                    >
                        Filters
                    </button>
                    <div 
                        className={`accordion-dropdown ${isDropdownOpen ? 'show' : ''}`}
                    >
                        <div className="accordion-body">
                            <FilterItems />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilterSideBar);
