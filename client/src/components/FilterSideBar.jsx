import React, { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { useSideBar } from "../contexts/SideBarContext";
import "../styles/Categories.css";
import FilterItems from "./FilterItems";

const FilterSideBar = ({ className = '' }) => {
    const { isOpen, setIsOpen } = useSideBar();
    const [activeKey, setActiveKey] = useState(isOpen ? '0' : null);

    // Sync accordion state with sidebar state
    useEffect(() => {
        setActiveKey(isOpen ? '0' : null);
    }, [isOpen]);

    const handleAccordionClick = (event) => {
        // Prevent the default behavior to handle the toggle ourselves
        event.preventDefault();
        event.stopPropagation();

        // Toggle the sidebar state
        const newState = !isOpen;
        setIsOpen(newState);
        setActiveKey(newState ? '0' : null);
    };

    // Handle when accordion is toggled directly (e.g., keyboard navigation)
    const handleAccordionToggle = (newActiveKey) => {
        const isOpening = newActiveKey === '0';
        setIsOpen(isOpening);
        setActiveKey(isOpening ? '0' : null);
    };

    return (
        <div className="set category-wrapper">
            <Accordion activeKey={activeKey} onSelect={handleAccordionToggle}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header
                        onClick={handleAccordionClick}
                        id="all"
                    >
                        Filters
                    </Accordion.Header>
                    <Accordion.Body className="accordion-dropdown">
                        <FilterItems />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default React.memo(FilterSideBar);
