import React from "react";
import ProductCard from "./ProductCard";
import { useTheme } from "../contexts/ThemeContext";
import { useWishList } from "../contexts/WishListContext";
import { useSideBar } from "../contexts/SideBarContext";
import cartLight from "../assets/cart-light.png";
import cartDark from "../assets/cart-dark.png";

function WishList() {
    const { mode } = useTheme();
    const { wishList } = useWishList();
    const { isOpen } = useSideBar();

    // Determine the number of columns based on sidebar state
    const getGridColumns = () => {
        if (isOpen) {
            return 'row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4';
        }
        return 'row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5';
    };

    if (wishList.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center gap-5" style={{ height: "50vh" }}>
                <img src={mode ? cartLight : cartDark} alt="Wishlist" />
                <h1>Your Wish List Is Empty!</h1>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column w-100">
            <div className="scroll-wrapper w-100">
                <div className={`row ${getGridColumns()} g-4`}>
                    {wishList.map((product, index) => (
                        <div key={index} className="col">
                            <div className="card-wrapper h-100">
                                <ProductCard product={product} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WishList;