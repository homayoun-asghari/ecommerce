import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { FaShoppingBag, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';

const About = () => {
  const { t } = useLanguage();
  const features = t('about:features', { returnObjects: true });
  const team = t('about:team', { returnObjects: true });
    return (
        <div className="py-5">
            {/* Hero Section */}
            <div className="py-5 mb-5 ">
                <Row className="align-items-center">
                    <Col lg={3}></Col>
                    <Col lg={6} className='text-center'>
                        <h1 className="display-4 fw-bold mb-4 d-inline-block">{t('about:hero.title')}</h1>
                        <p className="lead">
                            {t('about:hero.description')}
                        </p>
                    </Col>
                </Row>
            </div>

            {/* Our Story */}
            <Container className="my-5">
                <Row className="justify-content-center mb-5">
                    <Col lg={8} className="text-center">
                        <h2 className="fw-bold mb-4">{t('about:story.title')}</h2>
                        <p className="lead">
                            {t('about:story.content')}
                        </p>
                    </Col>
                </Row>

                {/* Features */}
                <Row className="g-4 mb-5">
                    {features.map((feature, index) => (
                        <Col md={4} key={index}>
                            <Card className="h-100 border-0 shadow-sm p-4 text-center">
                                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                                    {feature.icon === 'shopping-bag' && <FaShoppingBag />}
                                    {feature.icon === 'shield-alt' && <FaShieldAlt />}
                                    {feature.icon === 'headset' && <FaHeadset />}
                                </div>
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Team Section */}
                <Row className="mt-5 pt-5">
                    <Col className="text-center mb-5">
                        <h2 className="fw-bold">{team.title}</h2>
                        <p className="lead">{team.subtitle}</p>
                    </Col>
                </Row>
                <Row className="g-4">
                    {team.members.map((member, index) => (
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
