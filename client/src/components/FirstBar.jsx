import React from "react";
import Nav from 'react-bootstrap/Nav';
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import { Row, Col, Container } from 'react-bootstrap';
import ModeSwitch from "./ModeSwitch";
import Searchbar from "./Searchbar";
import { Search } from 'react-bootstrap-icons';
import { useTheme } from "../contexts/ThemeContext";
import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from "../contexts/CartContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishList } from "../contexts/WishListContext";
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageSwitcher from "./LanguageSwitcher";
import {useNotification} from "../contexts/NotificationContext";
import NotificationsIcon from '@mui/icons-material/Notifications';



function SecondBar() {
    const { mode } = useTheme();
    const { cartItems } = useCart();
    const { wishList } = useWishList();
    const {notifications} = useNotification();
    return (
        <Container fluid>
            <Row className="align-items-center justify-content-between g-3 py-2">
                <Col lg={7} xl={8} className="d-flex justify-content-center align-items-center gap-3">
                    <img src={mode ? logo : logoDark} alt="logo" className="img-fluid" style={{ maxHeight: '40px' }} />
                    <Searchbar button={<Search />} placeholder="Search Products" />
                </Col>

                <Col lg={5} xl={4} className="d-flex align-items-center justify-content-end gap-3">
                    <Nav.Link href="/account" className="d-flex align-items-end">
                        {/* <PersonIcon style={{ fontSize: 35 }} /> */}
                        <span className="text-nowrap">Hello <br /> <span style={{ fontWeight: "bold" }}>Account</span></span>
                    </Nav.Link>
                    <Nav.Link href="/account?tab=wishlist" className="d-flex align-items-end">
                        <Badge badgeContent={wishList.length}>
                            <FavoriteIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>

                    <Nav.Link href="/cart" className="d-flex align-items-end">
                        <Badge badgeContent={cartItems.length} >
                            <ShoppingCartIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>

                    <Nav.Link href="/account?tab=notifications" className="d-flex align-items-end">
                        <Badge badgeContent={notifications.filter(n => n.is_read === false).length} >
                            <NotificationsIcon style={{ fontSize: 30 }} />
                        </Badge>
                    </Nav.Link>

                    <LanguageSwitcher />

                    <ModeSwitch />
                </Col>
            </Row>
        </Container>
    );
}

export default SecondBar;
