import React, { useContext, useEffect, useState } from "react";
import Carousel from 'react-bootstrap/Carousel';
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MyContext from "../components/MyContext";
import "../styles/CarouselItems.css";

function CarouselItems() {
    const { isOpen } = useContext(MyContext);
    const [accordion, setAccordion] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAccordion(prev => !prev)
            }, 300)
        } else {
            setTimeout(() => {
                setAccordion(prev => !prev)
            }, 0)
        }
    }, [isOpen]);
    return (
        <Row className="mb-4">
            <Col lg={accordion ? 3 : 0}>
            </Col>
            <Col lg={accordion ? 9 : 12} >
                <Carousel fade>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 rounded"
                            src={hero1}
                            alt="First slide"
                            style={{ height: "500px", objectFit: "cover" }}
                        />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center">
                            <div className="carousel-highlight">
                                <h1 className="m-0">Buy Fresh</h1>
                                <p className="m-0">Get the latest deals.</p>
                                <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
                            </div>
                        </Carousel.Caption>


                    </Carousel.Item>

                    <Carousel.Item>
                        <img
                            className="d-block w-100 rounded"
                            src={hero2}
                            alt="Second slide"
                            style={{ height: "500px", objectFit: "cover" }}
                        />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center">
                            <div className="carousel-highlight">
                                <h1 className="m-0">Best Quality</h1>
                                <p className="m-0">Get the latest deals.</p>
                                <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item>
                        <img
                            className="d-block w-100 rounded"
                            src={hero3}
                            alt="Second slide"
                            style={{ height: "500px", objectFit: "cover" }}
                        />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center">
                            <div className="carousel-highlight">
                                <h1 className="m-0">For One Time Only</h1>
                                <p className="m-0">Get the latest deals.</p>
                                <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Col>
        </Row>
    );
}


export default CarouselItems;