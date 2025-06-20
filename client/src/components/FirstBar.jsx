import React from "react";
import Nav from 'react-bootstrap/Nav';
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import { Row, Col, Container } from 'react-bootstrap';
import ModeSwitch from "./ModeSwitch";
import LanguageSwitcher from "./LanguageSwitcher";
import Searchbar from "./Searchbar";
import { Search } from 'react-bootstrap-icons';
import { useTheme } from "../contexts/ThemeContext";
import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from "../contexts/CartContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishList } from "../contexts/WishListContext";
import {useNotification} from "../contexts/NotificationContext";
import NotificationsIcon from '@mui/icons-material/Notifications';



function SecondBar() {
    const { mode } = useTheme();
    const { cartItems } = useCart();
    const { wishList } = useWishList();
    const {notifications} = useNotification();
    return (
        <Container fluid className="px-3 px-md-4">
            <Row className="align-items-center py-2 gx-2 gx-md-3">
                {/* Logo */}
                <Col xs="auto" className="pe-0 pe-md-2">
                    <img 
                        src={mode ? logo : logoDark} 
                        alt="logo" 
                        className="img-fluid" 
                        style={{ 
                            height: '40px',
                            width: 'auto',
                            maxWidth: '120px',
                            objectFit: 'contain' 
                        }} 
                    />
                </Col>

                {/* Search Bar */}
                <Col className="px-0 px-md-2" style={{ minWidth: 0 }}> {/* minWidth: 0 prevents overflow */}
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <Searchbar 
                            button={<Search size={18} />} 
                            placeholder="Search Products" 
                            className="w-100"
                        />
                    </div>
                </Col>

                {/* Icons */}
                <Col xs="auto" className="d-flex align-items-center justify-content-end gap-2 gap-md-3 ps-2 ps-md-3">
                    {/* Account - Hidden on smallest screens */}
                    <Nav.Link href="/account" className="d-none d-md-flex align-items-center text-nowrap">
                        <span>Hello<br/><span className="fw-bold">Account</span></span>
                    </Nav.Link>
                    
                    {/* Wishlist */}
                    <Nav.Link href="/account?tab=wishlist" className="d-flex align-items-center">
                        <Badge badgeContent={wishList.length}>
                            <FavoriteIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>

                    {/* Cart */}
                    <Nav.Link href="/cart" className="d-flex align-items-center">
                        <Badge badgeContent={cartItems.length}>
                            <ShoppingCartIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>

                    {/* Notifications - Hidden on small screens */}
                    <Nav.Link href="/account?tab=notifications" className="d-none d-md-flex align-items-center">
                        <Badge badgeContent={notifications.filter(n => !n.is_read).length}>
                            <NotificationsIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>
                    
                    {/* Theme and Language Switchers */}
                    <div className="d-flex align-items-center gap-1 gap-md-2">
                    <LanguageSwitcher />
                        <ModeSwitch />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default SecondBar;
