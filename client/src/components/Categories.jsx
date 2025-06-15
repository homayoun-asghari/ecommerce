import "../styles/Categories.css";
import React from "react";
import Accordion from 'react-bootstrap/Accordion';
import { useSideBar } from "../contexts/SideBarContext";
import CategoryItems from "./CategoryItems";

function Categories() {
    const { setIsOpen } = useSideBar();

    function handleClick() {
        setIsOpen(prev => !prev);
    }
    return (
        <div className="set category-wrapper">
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header id="all" onClick={handleClick}>All categories</Accordion.Header>
                    <Accordion.Body className="accordion-dropdown">
                        <CategoryItems />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default Categories;