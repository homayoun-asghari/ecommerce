import React, { useState } from "react";
import { Nav, Offcanvas, Accordion } from "react-bootstrap";
import { House, Person, Heart, Cart } from "react-bootstrap-icons";
import "../styles/BottomNavbar.css";
import { useEffect } from "react";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import Searchbar from "./Searchbar";
import AccordionItems from "./AccordionItems";
import ModeSwitch from "./ModeSwitch";
import { Search } from 'react-bootstrap-icons';

function BottomNavbar(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
      <div className={`bottom-nav ${props.mode ? "bottom-nav-light" : "bottom-nav-dark"} d-flex justify-content-around align-items-center`}
      >
        <Nav className="justify-content-around w-100">
          <Nav.Link onClick={handleShow}>
            <img src={props.mode ? logo : logoDark} alt="logo" className="img-fluid" style={{ maxHeight: '24px' }} />
          </Nav.Link>
          <Nav.Link href="/cart">
            <Cart size={24} />
          </Nav.Link>
          <Nav.Link href="/">
            <House size={24} />
          </Nav.Link>
          <Nav.Link href="/wishlist">
            <Heart size={24} />
          </Nav.Link>
          <Nav.Link href="/profile">
            <Person size={26} />
          </Nav.Link>
        </Nav>
      </div>

      <Offcanvas show={show} onHide={handleClose} placement="start" >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>More Options</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column">
          {/* Scrollable Main Content */}
          <div className="flex-grow-1 overflow-auto">
          <Searchbar button = {<Search />} placeholder = "Search Products"/>

            <Accordion className="mt-3">
              <AccordionItems />
            </Accordion>
          </div>

          <div className="offcanvas-footer mt-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <Nav className="d-flex gap-3">
              <Nav.Link href="/blog" onClick={handleClose}>Blog</Nav.Link>
              <Nav.Link href="/contact" onClick={handleClose}>Contact</Nav.Link>
              <Nav.Link href="/about" onClick={handleClose}>About</Nav.Link>
            </Nav>

            <ModeSwitch mode={props.mode} onSubmit={props.onSubmit} />
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default BottomNavbar;
