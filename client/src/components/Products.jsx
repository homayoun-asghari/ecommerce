import React from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from "react-bootstrap-icons";

import product1 from "../assets/product1.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";
import product4 from "../assets/product4.png";
import product5 from "../assets/product5.png";

function NewArrivals(props) {
    return (
        <Row className='d-flex justify-content-center align-items-center gap-2'>
            <div className="d-flex flex-row gap-5 justify-content-between align-items-center">
                <div>
                    <h5>{props.title}</h5>
                    <p>{props.content}</p>
                </div>
                <div>
                    <Link to="/shop" className="btn btn-outline-primary text-nowrap">View All {<ArrowRight />}</Link>
                </div>
            </div>

            <Col className='d-flex justify-content-center align-items-center'>
                <Card style={{ width: '18rem' }} >
                    <Card.Img variant="top" src={product1} />
                    <Link to="/shop" className="btn"><Heart size={24} /></Link>
                    <Card.Body>
                        <Card.Title>$0.50 <span style={{ textDecoration: "line-through", color: "var(--color-link)" }}>$1.99</span></Card.Title>
                        <Card.Text>
                            100 Percent Apple Juice – 64
                            fl oz Bottle
                        </Card.Text>
                        <Link to="/shop" className="btn btn-outline-primary">Add To Cart</Link>
                        <Link to="/shop" className="btn btn-outline-primary m-1">+</Link>

                    </Card.Body>
                </Card>
            </Col>

            <Col className='d-flex justify-content-center align-items-center'>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={product2} />
                    <Link to="/shop" className="btn"><Heart size={24} /></Link>
                    <Card.Body>
                        <Card.Title>$2.45 <span style={{ textDecoration: "line-through", color: "var(--color-link)" }}>$4.13</span></Card.Title>
                        <Card.Text>
                            Simply Orange Pulp Free Juice
                            – 52 fl oz
                        </Card.Text>
                        <Link to="/shop" className="btn btn-outline-primary">Add To Cart</Link>
                        <Link to="/shop" className="btn btn-outline-primary m-1">+</Link>
                    </Card.Body>
                </Card>
            </Col>


            <Col className='d-flex justify-content-center align-items-center'>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={product3} />
                    <Link to="/shop" className="btn"><Heart size={24} /></Link>
                    <Card.Body>
                        <Card.Title>$11.77 <span style={{ textDecoration: "line-through", color: "var(--color-link)" }}>$14.77</span></Card.Title>
                        <Card.Text>
                            California Pizza Kitchen
                            Margherita, Crispy Thin Crus…
                        </Card.Text>
                        <Link to="/shop" className="btn btn-outline-primary">Add To Cart</Link>
                        <Link to="/shop" className="btn btn-outline-primary m-1">+</Link>
                    </Card.Body>
                </Card>
            </Col>


            <Col className='d-flex justify-content-center align-items-center'>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={product4} />
                    <Link to="/shop" className="btn"><Heart size={24} /></Link>
                    <Card.Body>
                        <Card.Title>$1.25 <span style={{ textDecoration: "line-through", color: "var(--color-link)" }}>$2.98</span></Card.Title>
                        <Card.Text>
                            Cantaloupe Melon Fresh
                            Organic Cut
                        </Card.Text>
                        <Link to="/shop" className="btn btn-outline-primary">Add To Cart</Link>
                        <Link to="/shop" className="btn btn-outline-primary m-1">+</Link>
                    </Card.Body>
                </Card>
            </Col>


            <Col className='d-flex justify-content-center align-items-center'>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={product5} />
                    <Link to="/shop" className="btn"><Heart size={24} /></Link>
                    <Card.Body>
                        <Card.Title>$14.12 <span style={{ textDecoration: "line-through", color: "var(--color-link)" }}>$17.12</span></Card.Title>
                        <Card.Text>
                            Angel Soft Toilet Paper, 9
                            Mega Rolls
                        </Card.Text>
                        <Link to="/shop" className="btn btn-outline-primary">Add To Cart</Link>
                        <Link to="/shop" className="btn btn-outline-primary m-1">+</Link>
                    </Card.Body>
                </Card>
            </Col>

        </Row>
    );
}

export default NewArrivals;