import React from "react";
import Accordion from 'react-bootstrap/Accordion';
import "../styles/SideBar.css";
import AccordionItems from "./AccordionItems";

function SideBar() {
    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion>
                    <Accordion.Item eventKey="0">
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