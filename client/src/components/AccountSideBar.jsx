import "../styles/Categories.css";
import React, { useState, useEffect, useRef } from "react";
import { useSideBar } from "../contexts/SideBarContext";
import { useUser } from "../contexts/UserContext";
import PersonIcon from '@mui/icons-material/Person';
import AccountTabs from "./AccountTabs.jsx";
import SellerAccountTabs from "./SellerAccountTabs.jsx";
import AdminAccountTabs from "./AdminAccountTabs.jsx";

function AccountSideBar() {
    const { isOpen, setIsOpen } = useSideBar();
    const { user } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const dropdownRef = useRef(null);
    const isFirstRender = useRef(true);
    
    const userName = user?.data?.name;
    const userRole = user?.data?.role;

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
                        <div className="d-flex align-items-center gap-1">
                            <PersonIcon style={{ fontSize: 20 }} />
                            <span>{userName}</span>
                        </div>
                    </button>
                    <div 
                        className={`accordion-dropdown ${isDropdownOpen ? 'show' : ''}`}
                    >
                        <div className="accordion-body">
                            {userRole === "buyer" && <AccountTabs />}
                            {userRole === "seller" && <SellerAccountTabs />}
                            {userRole === "admin" && <AdminAccountTabs />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountSideBar;