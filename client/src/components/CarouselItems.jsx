import React from "react";
import Carousel from 'react-bootstrap/Carousel';
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled, { keyframes } from 'styled-components';
import "../styles/CarouselItems.css";
import { useSideBar } from "../contexts/SideBarContext";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0.95; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const AnimatedCarousel = styled(Carousel)`
  transition: all 0.5s ease-in-out;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .carousel-item {
    transition: transform 0.5s ease-in-out;
  }
  
  .carousel-item img {
    transition: transform 5s ease-in-out;
  }
  
  .carousel-item.active img {
    transform: scale(1.02);
  }
`;

const SlideContent = styled.div`
  background: rgba(0, 0, 0, 0.6);
  padding: 2rem;
  border-radius: 0.5rem;
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
  
  h1 {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease-in-out;
  }
  
  p {
    color: rgba(255, 255, 255, 0.85);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease-in-out;
  }
  
  .btn {
    transition: all 0.3s ease-in-out;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
`;

function CarouselItems() {
    const { isOpen } = useSideBar();
    
    return (
        <Row className="mb-4 mx-0" style={{ minHeight: '500px', width: '100%' }}>
            <Col xl={isOpen ? 3 : 0} lg={isOpen ? 4 : 0} className="p-0" style={{
                transition: 'all 0.3s ease-in-out',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                maxWidth: isOpen ? '25%' : '0',
                flex: isOpen ? '0 0 25%' : '0 0 0',
                padding: 0,
                margin: 0
            }}>
            </Col>
            <Col xl={isOpen ? 9 : 12} lg={isOpen ? 8 : 12} className="p-0" style={{
                transition: 'all 0.3s ease-in-out',
                marginLeft: 'auto',
                flex: isOpen ? '0 0 75%' : '0 0 100%',
                maxWidth: isOpen ? '75%' : '100%'
            }}>
                <AnimatedCarousel fade>
                    <Carousel.Item interval={5000}>
                        <div style={{
                            height: '500px',
                            backgroundImage: `url(${hero1})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 5s ease-in-out'
                        }} />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center h-100">
                            <SlideContent>
                                <h1 className="display-4 fw-bold mb-3">Buy Fresh</h1>
                                <p className="lead mb-4">Get the latest deals on fresh products</p>
                                <Link to="/shop" className="btn btn-primary btn-lg px-4 py-2">
                                    Shop Now
                                </Link>
                            </SlideContent>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item interval={5000}>
                        <div style={{
                            height: '500px',
                            backgroundImage: `url(${hero2})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 5s ease-in-out'
                        }} />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center h-100">
                            <SlideContent>
                                <h1 className="display-4 fw-bold mb-3">Best Quality</h1>
                                <p className="lead mb-4">Premium products for your needs</p>
                                <Link to="/shop" className="btn btn-primary btn-lg px-4 py-2">
                                    Shop Now
                                </Link>
                            </SlideContent>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item interval={5000}>
                        <div style={{
                            height: '500px',
                            backgroundImage: `url(${hero3})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 5s ease-in-out'
                        }} />
                        <Carousel.Caption className="d-flex justify-content-center align-items-center h-100">
                            <SlideContent>
                                <h1 className="display-4 fw-bold mb-3">Limited Time</h1>
                                <p className="lead mb-4">Special offers just for you</p>
                                <Link to="/shop" className="btn btn-primary btn-lg px-4 py-2">
                                    Shop Now
                                </Link>
                            </SlideContent>
                        </Carousel.Caption>
                    </Carousel.Item>
                </AnimatedCarousel>
            </Col>
        </Row>
    );
}


export default CarouselItems;