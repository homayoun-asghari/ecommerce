import React from "react";
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import styled, { keyframes } from 'styled-components';
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import { Link } from 'react-router-dom';
import "../styles/CarouselItems.css";
import { useSideBar } from "../contexts/SideBarContext";

// ContentColumn styled component for sidebar layout
const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;



// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0.95; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const AnimatedCarousel = styled(Carousel)`
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-radius: 0.75rem;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  }
  
  .carousel-inner {
    overflow: hidden;
    position: relative;
    width: 100%;
    padding-top: 40%; /* Standard hero aspect ratio */
    max-height: 600px; /* Maximum height for larger screens */
    
    @media (max-width: 992px) {
      padding-top: 50%; /* Slightly taller on medium screens */
    }
    
    @media (max-width: 768px) {
      padding-top: 60%; /* Taller on mobile */
    }
  }
  
  .carousel-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1s ease-in-out;
    transition-delay: 0.3s;
    
    &.active {
      opacity: 1;
      z-index: 1;
    }
  }
  
  .carousel-item img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 10s ease-in-out;
  }
  
  .carousel-item.active img {
    transform: scale(1.05);
  }
  
  .carousel-control-prev,
  .carousel-control-next {
     width: 50px;
    height: 50px;
    backdrop-filter: blur(10px);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-50%) scale(1.1);
    }
    
    @media (max-width: 576px) {
        width: 40px;
        height: 40px;
    }
  }
  
  &:hover .carousel-control-prev,
  &:hover .carousel-control-next {
    opacity: 1;
  }
  
  .carousel-indicators {
    bottom: 20px;
    margin: 0;
    padding: 0 15px;
    justify-content: flex-end;
    z-index: 2;
    
    button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin: 0 6px;
      background-color: rgba(255, 255, 255, 0.5);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &.active {
        background-color: #fff;
        transform: scale(1.25);
        border-color: rgba(255, 255, 255, 0.8);
      }
      
      &:hover:not(.active) {
        background-color: rgba(255, 255, 255, 0.7);
      }
    }
  }
`;

const SlideContent = styled.div`
  background: rgba(0, 0, 0, 0.6);
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  transform: translateY(0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  h1 {
    color: #fff;
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
    transition: all 0.5s ease;
    
    @media (max-width: 992px) {
      font-size: 2.2rem;
    }
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    transition: all 0.5s ease;
    
    @media (max-width: 992px) {
      font-size: 1rem;
      margin-bottom: 1.25rem;
    }
    
    @media (max-width: 768px) {
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }
  }
  
  .btn {
    font-size: 1rem;
    font-weight: 600;
    padding: 0.6rem 1.75rem;
    border-radius: 50px;
    background: var(--color-primary);
    border: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      background: var(--color-primary-dark);
    }
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 768px) {
      padding: 0.6rem 1.5rem;
      font-size: 1rem;
    }
  }
`;

function CarouselItems() {
    const { isOpen } = useSideBar();
    
    return (
        <Container fluid className="py-4 px-0 px-md-3">
            <div className="position-relative" style={{ minHeight: '500px', width: '100%' }}>
                <ContentColumn $isOpen={isOpen} className="px-0 px-md-3">
                    <AnimatedCarousel fade>
                    <Carousel.Item interval={5000}>
                        <img
                            className="d-block w-100"
                            src={hero1}
                            alt="Fresh products"
                        />
                        <Carousel.Caption>
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
                        <img
                            className="d-block w-100"
                            src={hero2}
                            alt="New Arrivals"
                        />
                        <Carousel.Caption>
                            <SlideContent>
                                <h1 className="display-4 fw-bold mb-3">New Arrivals</h1>
                                <p className="lead mb-4">Discover our latest collection</p>
                                <Link to="/shop" className="btn btn-primary btn-lg px-4 py-2">
                                    Shop Now
                                </Link>
                            </SlideContent>
                        </Carousel.Caption>
                    </Carousel.Item>

                    <Carousel.Item interval={5000}>
                        <img
                            className="d-block w-100"
                            src={hero3}
                            alt="Special Offers"
                        />
                        <Carousel.Caption>
                            <SlideContent>
                                <h1 className="display-4 fw-bold mb-3">Special Offers</h1>
                                <p className="lead mb-4">Limited time deals you don't want to miss</p>
                                <Link to="/shop" className="btn btn-primary btn-lg px-4 py-2">
                                    Shop Now
                                </Link>
                            </SlideContent>
                        </Carousel.Caption>
                    </Carousel.Item>
                        </AnimatedCarousel>
                    </ContentColumn>
                </div>
            </Container>
    );
}


export default CarouselItems;