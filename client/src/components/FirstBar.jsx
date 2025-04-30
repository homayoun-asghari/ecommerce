import React from "react";
import Nav from 'react-bootstrap/Nav';
import logo from "../assets/logo.png";
import logoDark from "../assets/logo-dark.png";
import { Row, Col, Container } from 'react-bootstrap';
import { Person, Heart, Cart, PinMapFill } from "react-bootstrap-icons";
import ModeSwitch from "./ModeSwitch";
import Searchbar from "./Searchbar";
import { Search } from 'react-bootstrap-icons';

function SecondBar(props) {
    return (
        <Container fluid>
            <Row className="align-items-center g-3 py-2">
                <Col lg={3} >
                    <Row className="w-100 justify-content-center align-items-center">
                        <Col xs={6} className="d-flex justify-content-center align-items-center">
                            <img src={props.mode ? logo : logoDark} alt="logo" className="img-fluid" style={{ maxHeight: '40px' }} />
                        </Col>
                        <Col xs={6} className="d-flex justify-content-center align-items-center">
                            <Nav.Link href="/signin">
                                <PinMapFill size={24} /> <span className="text-nowrap">Deliver To</span>
                            </Nav.Link>
                        </Col>
                    </Row>
                </Col>

                <Col lg={5} className="d-flex justify-content-center align-items-center">
                    <Searchbar button = {<Search />} placeholder = "Search Products"/>
                </Col>

                <Col lg={4} className="d-flex align-items-center justify-content-lg-end gap-3">
                    <Row className="w-100 justify-content-center align-items-center">
                        <Col lg={3} className="d-flex justify-content-center align-items-center">
                            <Nav.Link href="/account">
                                <Person size={26} /> <span className="text-nowrap" >Account</span>
                            </Nav.Link>
                        </Col>
                        <Col lg={3} className="d-flex justify-content-center align-items-center">
                            <Nav.Link href="/signin">
                                <Heart size={24} /> <span className="text-nowrap" >Wish List</span>
                            </Nav.Link>
                        </Col>
                        <Col lg={3} className="d-flex justify-content-center align-items-center">
                            <Nav.Link href="/signin">
                                <Cart size={24} /> <span className="text-nowrap" >Cart</span>
                            </Nav.Link>
                        </Col>
                        <Col lg={3} className="d-flex justify-content-center align-items-center">
                            <ModeSwitch mode={props.mode} onSubmit={props.onSubmit} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default SecondBar;
