import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { useSideBar } from "../contexts/SideBarContext";
import "../styles/Categories.css";
import FilterItems from "./FilterItems";

const FilterSideBar = ({ className = '' }) => {
    
    const { setIsOpen } = useSideBar();
    function handleClick() {
        setIsOpen(prev => !prev);
    }

    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header
                            onClick={handleClick}
                            id="all"
                        >
                            Filters
                        </Accordion.Header>
                        <Accordion.Body className="accordion-dropdown" >
                            <FilterItems />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

export default React.memo(FilterSideBar);
