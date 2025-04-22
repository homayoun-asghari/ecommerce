import React from "react";
import { useLocation } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Badge from 'react-bootstrap/Badge';
import SideBar from "./SideBar";

function ThirdBar() {
    const location = useLocation();
    return (
        <div className="bar">
            <div className="set" style={{ gap: "var(--space-xxl)" }}>
                <SideBar />

                <Nav variant="underline" activeKey={location.pathname}>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/" eventKey="/">Home</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/shop" eventKey="/shop">Shop</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/blog" eventKey="/blog">Blog</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/contact" eventKey="/contact">Contact</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <div className="set">
                <Dropdown as={NavItem}>
                    <Dropdown.Toggle as={NavLink}>Trending Products</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item>French</Dropdown.Item>
                        <Dropdown.Item>Spain</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown as={NavItem}>
                    <Dropdown.Toggle as={NavLink} style={{ color: "#DC3545" }}>Almost Finished  {<Badge bg="danger">SALE</Badge>}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item>EUR</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

        </div>
    );
}

export default ThirdBar;