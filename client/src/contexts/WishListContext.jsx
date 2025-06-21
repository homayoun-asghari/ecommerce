import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";

const WishListContext = createContext();

export function WishListProvider({ children }) {
    const [wishList, setWishList] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        if (!userId) {
            setWishList([]);
            return;
        }

        async function fetchWishList() {
            try {
                const response = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}`);
                const data = await response.json();
                if (response.ok) setWishList(data);
            } catch (err) {
                console.error("Wishlist fetch error", err);
            }
        }

        fetchWishList();
    }, [userId]);

    async function addToWishList(productId) {
        if (wishList.some(item => item.id === productId)) return;
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, userId }),
            });

            const data = await response.json();
            if (response.ok && data) {
                setWishList(prev => [...prev, data]);
            }
        } catch (err) {
            console.error("Add to wishlist failed", err);
        }
    }

    async function removeFromWishList(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, userId }),
            });

            if (response.ok) {
                setWishList(prev => prev.filter(item => item.id !== productId));
            }
        } catch (err) {
            console.error("Remove from wishlist failed", err);
        }
    }

    return (
        <WishListContext.Provider value={{ wishList, addToWishList, removeFromWishList }}>
            {children}
        </WishListContext.Provider>
    );
}

export function useWishList() {
    return useContext(WishListContext);
}
