import React from "react";
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

function FirstBar() {
    return (
        <div className="bar">
            <div className="set">
                <Nav as="ul">
                    <Nav.Item as="li">
                        <Nav.Link href="/about">About Us</Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                        <Nav.Link href="/account">My Account</Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                        <Nav.Link href="/wish">Wish List</Nav.Link>
                    </Nav.Item>
                </Nav>
                <p>We deliver to you every day from <span style={{ color: "var(--color-accent)", fontWeight: "bolder" }}>7:00 to 23:00</span></p>
            </div>
            <div className="set">
                <Nav as="ul">
                    <Dropdown as={NavItem}>
                        <Dropdown.Toggle as={NavLink}>English</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>French</Dropdown.Item>
                            <Dropdown.Item>Spain</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown as={NavItem}>
                        <Dropdown.Toggle as={NavLink}>USD</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>EUR</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Nav.Item as="li">
                        <Nav.Link href="/ordertracking">Order Tracking</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
        </div>
    );
}

export default FirstBar;