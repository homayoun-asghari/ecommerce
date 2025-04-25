import React from "react";
import "../styles/Footer.css"
import { Row, Col, Container } from 'react-bootstrap';
import Searchbar from "./Searchbar";
import visa from "../assets/visa.png";
import payment from "../assets/payment.png";
import paypal from "../assets/paypal.png";
import skrill from "../assets/skrill.png";
import klarna from "../assets/klarna.png";
import googlePlay from "../assets/googlePlay.png";
import appStore from "../assets/appStore.png";
import { Telephone, Envelope, Facebook, Instagram, Twitter} from "react-bootstrap-icons";
import { Nav } from "react-bootstrap";

function Footer(props) {
    const year = new Date().getFullYear();
    return (
        <Container fluid className={`footer g-5 ${props.mode ? "footer-light" : "footer-dark"}`}>
            <Row lg={6} md={12}>
                <Col lg={8} md={12} >
                    <h5>Join our newsletter for 10$ offs</h5>
                    <p>Register now to get latest updates on promotions &
                        coupons.Don’t worry, we not spam!</p>
                </Col>

                <Col lg={4} md={12} className="d-flex flex-column align-items-end">
                    <Searchbar button="Send" placeholder="Enter Your Email" />
                    <p>By subscribing you agree to our Terms & Conditions and Privacy & Cookies Policy.</p>
                </Col>
            </Row>


            <Row className="py-2 g-5" lg={6} md={12} >
                <Col>
                    <h5>Need Help ?</h5>
                    <p>Autoseligen syr. Nek diarask fröbomba. Nör antipol kynoda nynat. Pressa fåmoska.</p>

                    <p style={{ margin: "0" }}>Monday-Friday: 08am-9pm</p>
                    <h6>{<Telephone />} 0 800 300-353</h6>

                    <p style={{ margin: "0" }}>Need help with your order?</p>
                    <h6>{<Envelope />} info@example.com</h6>
                </Col>

                <Col >
                    <h5>Make Money </h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            Sell on Grogin
                        </Nav.Link>
                        <Nav.Link href="/">
                            Sell Your Services on Grogin
                        </Nav.Link>
                        <Nav.Link href="/">
                            Sell on Grogin Business
                        </Nav.Link>
                        <Nav.Link href="/">
                            Sell Your Apps on Grogin
                        </Nav.Link>
                        <Nav.Link href="/">
                            Become an Affilate
                        </Nav.Link>
                        <Nav.Link href="/">
                            Advertise Your Products
                        </Nav.Link>
                        <Nav.Link href="/">
                            Sell-Publish with Us
                        </Nav.Link>
                        <Nav.Link href="/">
                            Become an Blowwe Vendor
                        </Nav.Link>
                    </Nav>
                </Col>

                <Col >
                    <h5>Let Us Help You</h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            Accessibility Statement
                        </Nav.Link>
                        <Nav.Link href="/">
                            Your Orders
                        </Nav.Link>
                        <Nav.Link href="/">
                            Returns & Replacements
                        </Nav.Link>
                        <Nav.Link href="/">
                            Shipping Rates & Policies
                        </Nav.Link>
                        <Nav.Link href="/">
                            Refund and Returns Policy
                        </Nav.Link>
                        <Nav.Link href="/">
                            Privacy Policy
                        </Nav.Link>
                        <Nav.Link href="/">
                            Terms and Conditions
                        </Nav.Link>
                        <Nav.Link href="/">
                            Cookie Settings
                        </Nav.Link>
                        <Nav.Link href="/">
                            Help Center
                        </Nav.Link>
                    </Nav>
                </Col>
                <Col >
                    <h5>Get to Know Us</h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            Careers for Grogin
                        </Nav.Link>
                        <Nav.Link href="/">
                            About Grogin
                        </Nav.Link>
                        <Nav.Link href="/">
                            Inverstor Relations
                        </Nav.Link>
                        <Nav.Link href="/">
                            Grogin Devices
                        </Nav.Link>
                        <Nav.Link href="/">
                            Customer reviews
                        </Nav.Link>
                        <Nav.Link href="/">
                            Social Responsibility
                        </Nav.Link>
                        <Nav.Link href="/">
                            Store Locations
                        </Nav.Link>
                    </Nav>
                </Col>
                <Col  >
                    <h5>Download our app</h5>
                    <Nav.Link href="/">
                        <img src={googlePlay} alt="google play logo" />
                    </Nav.Link>
                    <p className="text-nowrap" style={{ paddingLeft: "var(--space-xs)" }}>Download App Get
                        -10% Discount</p>
                    <Nav.Link href="/">
                        <img src={appStore} alt="app store logo" />
                    </Nav.Link>
                    <p className="text-nowrap" style={{ paddingLeft: "var(--space-xs)" }}>Download App Get
                        -20% Discount</p>
                </Col>

                <Col>
                    <h5>Follow us:</h5>

                    <Nav>
                        <Nav.Link href="/">
                            <h6>{<Facebook />}</h6>
                        </Nav.Link>
                        <Nav.Link href="/">
                            <h6>{<Instagram />}</h6>
                        </Nav.Link>
                        <Nav.Link href="/">
                            <h6>{<Twitter />}</h6>
                        </Nav.Link>
                    </Nav>

                    <p style={{ paddingTop: "var(--space-md)", margin: "0" }}>Payment Methods:</p>
                    <span><img src={visa} alt="visa logo" />    <img src={payment} alt="payment logo" />    <img src={paypal} alt="paypal logo" />  <img src={skrill} alt="skrill logo" />  <img src={klarna} alt="klarna logo" /></span>
                </Col>
            </Row>


            <Row lg={6} md={12} >
                <Col lg={6} md={12} className="d-flex flex-column align-items-start">
                    <p>Copyright © {year} Jinstore WooCommerce WordPress Theme. All right reserved. Powered by BlackRise Themes.</p>
                </Col>

                <Col lg={6} md={12} className="d-flex flex-column align-items-end">
                    <Nav>
                        <Nav.Link href="/">
                            Terms and Conditions
                        </Nav.Link>
                        <Nav.Link href="/">
                            Privacy Policy
                        </Nav.Link>
                        <Nav.Link href="/">
                            Order Tracking
                        </Nav.Link>

                    </Nav>
                </Col>

            </Row>

        </Container>
    );
}


export default Footer;