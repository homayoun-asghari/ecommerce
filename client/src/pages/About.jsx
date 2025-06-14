import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { FaShoppingBag, FaShieldAlt, FaHeadset } from 'react-icons/fa';

const About = () => {
    return (
        <div className="py-5">
            {/* Hero Section */}
            <div className="py-5 mb-5 ">
                <Row className="align-items-center">
                    <Col lg={3}></Col>
                    <Col lg={6} className='text-center'>
                        <h1 className="display-4 fw-bold mb-4 d-inline-block">About Our Store</h1>
                        <p className="lead">
                            We're passionate about bringing you the best products with exceptional quality and service.
                            Our journey began with a simple idea: to make online shopping easy, enjoyable, and reliable.
                        </p>
                    </Col>
                </Row>
            </div>

            {/* Our Story */}
            <Container className="my-5">
                <Row className="justify-content-center mb-5">
                    <Col lg={8} className="text-center">
                        <h2 className="fw-bold mb-4">Our Story</h2>
                        <p className="lead">
                            Founded in 2023, our store has grown from a small startup to a trusted name in online retail.
                            We believe in quality, sustainability, and creating lasting relationships with our customers.
                        </p>
                    </Col>
                </Row>

                {/* Features */}
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 text-center">
                            <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                                <FaShoppingBag />
                            </div>
                            <h4>Quality Products</h4>
                            <p>Carefully curated selection of high-quality items you'll love.</p>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 text-center">
                            <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                                <FaShieldAlt />
                            </div>
                            <h4>Secure Shopping</h4>
                            <p>Your security is our priority with encrypted transactions.</p>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 text-center">
                            <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                                <FaHeadset />
                            </div>
                            <h4>24/7 Support</h4>
                            <p>Our team is always here to help with any questions.</p>
                        </Card>
                    </Col>
                </Row>

                {/* Team Section */}
                <Row className="mt-5 pt-5">
                    <Col className="text-center mb-5">
                        <h2 className="fw-bold">Meet Our Team</h2>
                        <p className="lead">The passionate people behind our success</p>
                    </Col>
                </Row>
                <Row className="g-4">
                    {[
                        { name: 'Alex Johnson', role: 'CEO & Founder', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
                        { name: 'Sarah Williams', role: 'Head of Operations', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
                        { name: 'Michael Chen', role: 'Product Manager', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
                    ].map((member, index) => (
                        <Col md={4} key={index}>
                            <Card className="border-0 text-center">
                                <div className="rounded-circle overflow-hidden mx-auto mb-3" style={{ width: '200px', height: '200px' }}>
                                    <Image
                                        src={member.img}
                                        alt={member.name}
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                </div>
                                <Card.Body>
                                    <h5 className="mb-1">{member.name}</h5>
                                    <p className="text-muted">{member.role}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default About;
