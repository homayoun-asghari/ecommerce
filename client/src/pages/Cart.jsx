import React, { useEffect } from "react";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";
import { Col } from "react-bootstrap";
import { useUser } from "../contexts/UserContext";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Cart() {
    const { mode } = useTheme();
    const { cartItems } = useCart();
    const { user } = useUser();
    const userId = user?.data?.id;
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/account?tab=cart");
        }
    }, [user, navigate]);

    return (
        <>
            {cartItems.length === 0 &&
                <div className="d-flex flex-column justify-content-center align-items-center gap-5" style={{ height: "50vh" }}>
                    <img src={mode ? cartLight : cartDark} alt="Cart" />
                    <h1> Your Cart Is Empty!</h1>
                </div>
            }

            {cartItems.length !== 0 && <div className="d-flex flex-column justify-ontent-end">
                <div className="scroll-wrapper">
                    {cartItems.map((product) => (
                        <Col key={product.id} >
                            <div className="card-wrapper">
                                <ProductCard product={product} userId={userId} />
                            </div>
                        </Col>
                    ))}
                </div>
                <Link to="/checkout" className="btn btn-success">Check Out</Link>
            </div>
            }
        </>
    );
}

export default Cart;