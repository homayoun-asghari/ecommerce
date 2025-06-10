import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "./UserContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;
    const backup = JSON.parse(localStorage.getItem("cartItems"));

    const hasSyncedRef = useRef(false);
    const cartInitialized = useRef(false);

    // Load initial cart from localStorage (only once)
    useEffect(() => {
        if (!cartInitialized.current) {
            const saved = localStorage.getItem("cartItems");
            if (saved) {
                setCartItems(JSON.parse(saved));
            }
            cartInitialized.current = true;
        }
    }, []);

    // Sync cart to localStorage
    useEffect(() => {
        if (cartInitialized.current) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        }
    }, [cartItems]);

 useEffect(() => {
    async function syncCartOnLogin() {
        if (!userId || hasSyncedRef.current) return;

        try {
            const res = await fetch(`http://localhost:5050/cart/getDBCart?userId=${userId}`);
            const dbCart = await res.json();

            const mergedCart = [...cartItems];

            for (const dbItem of dbCart) {
                const localItem = mergedCart.find(item => item.id === dbItem.product_id);
                if (localItem) {
                    localItem.quantity = Math.max(localItem.quantity, dbItem.quantity);
                } else {
                    // 👇 Try to load product from localStorage backup (if available)
                    const backupItem = backup.find(item => item.id === dbItem.product_id);

                    if (backupItem) {
                        mergedCart.push({ ...backupItem, quantity: dbItem.quantity });
                    }
                }
            }

            setCartItems(mergedCart);
            updateDBCart(mergedCart);
            localStorage.removeItem("cartItems");
            hasSyncedRef.current = true;
        } catch (err) {
            console.error("Error syncing cart on login:", err);
        }
    }

    syncCartOnLogin();
}, [userId]);


    // Save to DB
    async function updateDBCart(updatedCart) {
        if (userId) {
            try {
                await fetch("http://localhost:5050/cart/updateDBCart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, cartItems: updatedCart }),
                });
            } catch (err) {
                console.error("Failed to update cart in DB:", err);
            }
        }
    }

    function addToCart(product) {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            const updated = existing
                ? prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
                : [...prev, { ...product, quantity: 1 }];
            updateDBCart(updated);
            console.log(updated);
            return updated;
        });
    }

    function removeFromCart(productId) {
        setCartItems(prev => {
            const updated = prev.filter(item => item.id !== productId);
            updateDBCart(updated);
            return updated;
        });
    }

    function updateQuantity(productId, qty) {
        if (qty < 1) return removeFromCart(productId);
        setCartItems(prev => {
            const updated = prev.map(item =>
                item.id === productId ? { ...item, quantity: qty } : item
            );
            updateDBCart(updated);
            return updated;
        });
    }

    function isInCart(id) {
        return cartItems.some(item => item.id === id);
    }

    function getQty(id) {
        return cartItems.find(item => item.id === id)?.quantity || 0;
    }

    function increment(id) {
        const qty = getQty(id);
        updateQuantity(id, qty + 1);
    }

    function decrement(id) {
        const qty = getQty(id);
        if (qty > 1) {
            updateQuantity(id, qty - 1);
        } else {
            removeFromCart(id);
        }
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                isInCart,
                increment,
                decrement,
                getQty
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
