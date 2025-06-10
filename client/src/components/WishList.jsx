import React from "react";
import ProductCard from "./ProductCard";
import { Col } from "react-bootstrap";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";
import { useTheme } from "../contexts/ThemeContext";
import { useWishList } from "../contexts/WishListContext";

function WishList() {
    const { mode } = useTheme();
    const { wishList } = useWishList();

    return (
        <>
            {wishList.length === 0 &&
                <div className="d-flex flex-column justify-content-center align-items-center gap-5" style={{ height: "50vh" }}>
                    <img src={mode ? cartLight : cartDark} alt="Cart" />
                    <h1>Your Wish List Is Empty!</h1>
                </div>
            }
            {wishList.length !== 0 && <div className="scroll-wrapper">
                {wishList.map((product, index) => (
                    <Col key={index} >
                        <ProductCard product={product} />
                    </Col>
                ))}
            </div>
            }
        </>
    );
}

export default WishList;