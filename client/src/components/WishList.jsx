import React from "react";
import ProductCard from "./ProductCard";
import { useTheme } from "../contexts/ThemeContext";
import { useWishList } from "../contexts/WishListContext";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";
import styled from 'styled-components';

function WishList() {
    const { mode } = useTheme();
    const { wishList } = useWishList();

    if (wishList.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center gap-5" style={{ height: "50vh" }}>
                <img src={mode ? cartLight : cartDark} alt="Wishlist" />
                <h1>Your Wish List Is Empty!</h1>
            </div>
        );
    }

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

    return (
        <div className="d-flex flex-column w-100">
            <div className="scroll-wrapper w-100">
                <ProductsGrid>
                    {wishList.map((product, index) => (
                        <div key={index} className="w-100">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </ProductsGrid>
            </div>
        </div>
    );
}

export default WishList;