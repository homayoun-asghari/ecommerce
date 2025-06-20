import React, { useEffect } from "react";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";
import { Col } from "react-bootstrap";
import { useUser } from "../contexts/UserContext";
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";
import { useSideBar } from "../contexts/SideBarContext";
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
    const location = useLocation();
    const isCartPage = location.pathname === '/cart';
    const { isOpen } = useSideBar();
    
    // Determine the number of columns based on sidebar state
    const getGridColumns = () => {
        if (isOpen) {
            return 'row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4';
        }
        return 'row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5';
    };

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
                <div className={`row ${getGridColumns()} g-4`}>
                    {cartItems.map((product) => (
                        <div key={product.id} className="col">
                            <div className="card-wrapper h-100">
                                <ProductCard product={product} userId={userId} />
                            </div>
                        </div>
                    ))}
                </div>
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
    const location = useLocation();
    const isCartPage = location.pathname === '/cart';
    const { isOpen } = useSideBar();

    useEffect(() => {
        if (user && isCartPage) {
            navigate("/account?tab=cart");
        }
    }, [user, navigate, isCartPage]);

    if (user && isCartPage) {
        return null; // Will be redirected by the effect
    }

    // When in account tab, we don't need the ContentColumn wrapper
    // as it's already wrapped by the Account page's ContentColumn
    if (!isCartPage) {
        return <CartContent isInTab={true} />;
    }

    return (
        <ContentColumn $isOpen={isOpen}>
            <CartContent isInTab={false} />
        </ContentColumn>
    );
}

export default Cart;