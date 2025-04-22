import React from "react";
import Accordion from 'react-bootstrap/Accordion';
import "../styles/SideBar.css";

function SideBar() {
    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion defaultActiveKey="0" >
                    <Accordion.Item eventKey="0">
                        <Accordion.Header id="all">All categories</Accordion.Header>
                        <Accordion.Body className="accordion-dropdown">
                            {/* Nested accordion or category links */}
                            <Accordion defaultActiveKey="1" alwaysOpen>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Fruits and Vegetables</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            <li>Apples</li>
                                            <li>Bananas</li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Accordion defaultActiveKey="1" alwaysOpen>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Fruits and Vegetables</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            <li>Apples</li>
                                            <li>Bananas</li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
}

export default SideBar;