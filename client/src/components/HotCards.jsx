import React from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import card1 from "../assets/card1.png";
import card2 from "../assets/card2.png";
import card3 from "../assets/card3.png";
import { ArrowRight } from "react-bootstrap-icons";

function HotCards() {
    return (
        <Row>
            <Col xs={12} md={6} lg={4} className="py-2">
                <Card className="text-white">
                    <Card.Img src={card1} alt="Card image" />
                    <Card.ImgOverlay className='d-flex flex-column justify-content-center'>
                        <Card.Title className='text-dark'>Quality eggs at an affordable price</Card.Title>
                        <div>
                            <Card.Text className='text-dark'>Only this week. Don’t miss...</Card.Text>
                            <Link to="/shop" className="btn btn-primary">Shop Now {<ArrowRight />}</Link>
                        </div>
                    </Card.ImgOverlay>
                </Card>
            </Col>
            <Col xs={12} md={6} lg={4} className="py-2">
                <Card className="text-white">
                    <Card.Img src={card2} alt="Card image" />
                    <Card.ImgOverlay className='d-flex flex-column justify-content-center'>
                        <Card.Title className='text-dark' >Snacks that nourishes our mind and body</Card.Title>
                        <div>
                            <Card.Text className='text-dark'>Only this week. Don’t miss...</Card.Text>
                            <Link to="/shop" className="btn btn-primary">Shop Now {<ArrowRight />}</Link>
                        </div>
                    </Card.ImgOverlay>
                </Card>
            </Col>
            <Col xs={12} md={6} lg={4} className="py-2">
                <Card className="text-white">
                    <Card.Img src={card3} alt="Card image" />
                    <Card.ImgOverlay className='d-flex flex-column justify-content-center'>
                        <Card.Title className='text-dark'>Unbeatable quality, unbeatable prices.</Card.Title>
                        <div>
                            <Card.Text className='text-dark'>Only this week. Don’t miss...</Card.Text>
                            <Link to="/shop" className="btn btn-primary">Shop Now {<ArrowRight />}</Link>
                        </div>
                    </Card.ImgOverlay>
                </Card>
            </Col>
        </Row>
    );
}


export default HotCards;