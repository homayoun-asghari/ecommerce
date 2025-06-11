import React, { useState } from "react";
import { Nav, Offcanvas, Accordion } from "react-bootstrap";
import "../styles/BottomNavbar.css";
import { useEffect } from "react";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import Searchbar from "./Searchbar";
import CategoryItems from "./CategoryItems.jsx";
import ModeSwitch from "./ModeSwitch";
import { Search } from 'react-bootstrap-icons';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from "../contexts/CartContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishList } from "../contexts/WishListContext";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation } from "react-router-dom";
import AccountTabs from "./AccountTabs.jsx";
import { useUser } from "../contexts/UserContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNotification } from "../contexts/NotificationContext";
import NotificationsIcon from '@mui/icons-material/Notifications';
import SellerAccountTabs from "./SellerAccountTabs.jsx";
import AdminAccountTabs from "./AdminAccountTabs.jsx";

function BottomNavbar() {
  const { mode } = useTheme();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { cartItems } = useCart();
  const { wishList } = useWishList();
  const location = useLocation();
  const { user } = useUser();
  const userRole = user?.data?.role;
  const { notifications } = useNotification();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setShow(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className={`bottom-nav ${mode ? "bottom-nav-light" : "bottom-nav-dark"} d-flex justify-content-around align-items-center`}
      >
        <Nav className="justify-content-around w-100">
          <Nav.Link onClick={handleShow}>
            <img src={mode ? logo : logoDark} alt="logo" className="img-fluid" style={{ maxHeight: '24px' }} />
          </Nav.Link>
          <Nav.Link href="/cart">
            <Badge badgeContent={cartItems.length}>
              <ShoppingCartIcon />
            </Badge>
          </Nav.Link>
          <Nav.Link href="/">
            <HomeIcon style={{ fontSize: 30 }} />
          </Nav.Link>
          <Nav.Link href="/account?tab=wishlist">
            <Badge badgeContent={wishList.length}>
              <FavoriteIcon />
            </Badge>
          </Nav.Link>
          <Nav.Link href="/account">
            <PersonIcon style={{ fontSize: 30 }} />
          </Nav.Link>
        </Nav>
      </div>

      <Offcanvas show={show} onHide={handleClose} placement="start" >
        <Offcanvas.Header className="d-flex gap-3" closeButton>
          <Nav.Link href="/account?tab=notifications" className="d-flex align-items-end">
            <Badge badgeContent={notifications.filter(n => n.is_read === false).length} >
              <NotificationsIcon style={{ fontSize: 30 }} />
            </Badge>
          </Nav.Link>
          <Offcanvas.Title><LanguageSwitcher /></Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column">
          {/* Scrollable Main Content */}
          <div className="flex-grow-1 overflow-auto">
            <Searchbar button={<Search />} placeholder="Search Products" />

            {(location.pathname === "/account" && userRole === "buyer") && <AccountTabs />}
            {(location.pathname === "/account" && userRole === "seller") && <SellerAccountTabs />}
            {(location.pathname === "/account" && userRole === "admin") && <AdminAccountTabs />}
            {(location.pathname !== "/account") && <Accordion className="mt-3"><CategoryItems /></Accordion>}
          </div>

          <div className="offcanvas-footer mt-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <Nav className="d-flex gap-3">
              <Nav.Link href="/blog" onClick={handleClose}>Blog</Nav.Link>
              <Nav.Link href="/contact" onClick={handleClose}>Contact</Nav.Link>
              <Nav.Link href="/about" onClick={handleClose}>About</Nav.Link>
            </Nav>

            <ModeSwitch />
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default BottomNavbar;
