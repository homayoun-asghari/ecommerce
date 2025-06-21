import React from "react";
import { NavLink, useLocation } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import SideBar from "./SideBar";
import { useLanguage } from '../hooks/useLanguage';

function SecondBar() {
    const location = useLocation();
    const { t } = useLanguage();
    
    return (
        <div className="bar">
            <div className="set" style={{ gap: "var(--space-xxl)" }}>
                <SideBar />

                <Nav variant="underline" activeKey={location.pathname}>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/" eventKey="/">
                            {t('navigation:home')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/shop" eventKey="/shop">
                            {t('navigation:shop')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/blog" eventKey="/blog">
                            {t('navigation:blog')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/contact" eventKey="/contact">
                            {t('navigation:contact')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="/about" eventKey="/about">
                            {t('navigation:about')}
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
        </div>
    );
}

export default SecondBar;