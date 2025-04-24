import React, { useContext } from "react";
import Accordion from 'react-bootstrap/Accordion';
import "../styles/SideBar.css";
import AccordionItems from "./AccordionItems";
import MyContext from "./MyContext";

function SideBar() {
    const { isOpen, setIsOpen } = useContext(MyContext);

    function handleClick() {
        setIsOpen(prev => !prev);
        console.log(isOpen);
    }
    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion>
                    <Accordion.Item eventKey="0" onClick={handleClick}>
                        <Accordion.Header id="all">All categories</Accordion.Header>
                        <Accordion.Body className="accordion-dropdown">
                            <AccordionItems />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
}

export default SideBar;