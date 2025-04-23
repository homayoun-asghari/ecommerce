import React from "react";
import Accordion from 'react-bootstrap/Accordion';

function AccordionItems() {
    return (
        <div>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Fruits & Vegetables</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Meats & Seafoods</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Breakfast & Dairy</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>Breads & Bakery</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header>Bevrages</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header>Frozen Foods</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header>Biscuits & Snacks</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="7">
                    <Accordion.Header>Healthcare</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>Apples</li>
                            <li>Bananas</li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default AccordionItems;