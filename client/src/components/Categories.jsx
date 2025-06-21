import "../styles/Categories.css";
import React, { useState, useEffect, useRef } from "react";
import { useSideBar } from "../contexts/SideBarContext";
import CategoryItems from "./CategoryItems";
import { useLanguage } from "../hooks/useLanguage";

function Categories() {
    const { isOpen, setIsOpen } = useSideBar();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const dropdownRef = useRef(null);
    const isFirstRender = useRef(true);
    const { t } = useLanguage();

    // Handle dropdown toggle
    const handleToggle = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(prev => !prev);
        setIsOpen(prev => !prev);
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
        }, 350); // Match this with your CSS transition duration

        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <div 
            className={`set category-wrapper ${isTransitioning ? 'sidebar-transitioning' : ''}`}
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
                        {t('categories:allCategories')}
                    </button>
                    <div 
                        className={`accordion-dropdown ${isDropdownOpen ? 'show' : ''}`}
                    >
                        <div className="accordion-body">
                            <CategoryItems />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Categories;