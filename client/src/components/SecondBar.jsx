import React from "react";
import { NavLink, useLocation } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
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
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/about" eventKey="/about">About</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <div className="set">
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/trendingproducts">Trending Products</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/sale">Almost Finished</Nav.Link>
                </Nav.Item>
            </div>

        </div>
    );
}

export default ThirdBar;