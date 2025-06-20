import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { API_BASE_URL } from "../config";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }
        async function fetchNotifications() {
            const res = await fetch(`${API_BASE_URL}/notification?userId=${userId}`);
            const data = await res.json();
            setNotifications(data);
        }
        fetchNotifications();
    }, [userId]);

    async function makeRead(id) {
        await fetch(`${API_BASE_URL}/notification/${id}/read`, { method: "PUT" });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    return (
        <NotificationContext.Provider value={{ notifications, makeRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}