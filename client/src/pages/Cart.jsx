import React, { useEffect } from "react";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";

import { useUser } from "../contexts/UserContext";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

const ContentColumn = styled.div`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

const CartContent = ({ isInTab = false }) => {
    const { mode } = useTheme();
    const { cartItems } = useCart();
    const { user } = useUser();
    const userId = user?.data?.id;
    const ProductsGrid = styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
        width: 100%;
        
        @media (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        
        @media (max-width: 576px) {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
    `;

    if (cartItems.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center gap-5" style={{ height: "50vh" }}>
                <img src={mode ? cartLight : cartDark} alt="Cart" />
                <h1>Your Cart Is Empty!</h1>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column w-100">
            <div className="scroll-wrapper w-100">
                <ProductsGrid>
                    {cartItems.map((item, index) => (
                        <div key={index} className="w-100">
                            <ProductCard product={item} userId={userId} />
                        </div>
                    ))}
                </ProductsGrid>
            </div>
            <div className="text-end mt-4">
                <Link 
                    to="/checkout" 
                    className="btn btn-success btn-lg"
                    style={{ minWidth: '200px' }}
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
};

function Cart() {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = window.location.pathname;
    const isCartPage = location === '/cart';
    
    useEffect(() => {
        if (user && isCartPage) {
            navigate("/account?tab=cart");
        }
    }, [user, navigate, isCartPage]);

    // If user is logged in and on cart page, show nothing (will redirect)
    if (user && isCartPage) {
        return null;
    }

    // If not on cart page (e.g., in account tab), just render the content
    if (!isCartPage) {
        return <CartContent isInTab={true} />;
    }

    // For non-logged in users on cart page
    return (
        <ContentColumn $isOpen={false}>
            <CartContent isInTab={false} />
        </ContentColumn>
    );
}

export default Cart;