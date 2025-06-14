import "../styles/Categories.css";
import React from "react";
import Nav from "react-bootstrap/Nav";
import { useAccountTab } from "../contexts/AccountTabContext";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function SellerAccountTabs() {
    const { activeTab, setActiveTab } = useAccountTab();
    const { logout } = useUser();
    const navigate = useNavigate();

    function handleClick(tab) {
        setActiveTab(tab);
    }

    return (

        <Nav className="flex-column" variant="underline" activeKey={activeTab}>
            <Nav.Link eventKey="dashboard" onClick={() => handleClick("dashboard")}>Dashboard</Nav.Link>
            <Nav.Link eventKey="users" onClick={() => handleClick("users")}>Users</Nav.Link>
            <Nav.Link eventKey="products" onClick={() => handleClick("products")}>Products</Nav.Link>
            <Nav.Link eventKey="orders" onClick={() => handleClick("orders")}>Orders</Nav.Link>
            <Nav.Link eventKey="payment" onClick={() => handleClick("payment")}>Payment & Payouts</Nav.Link>
            <Nav.Link eventKey="tickets" onClick={() => handleClick("tickets")}>Tickets</Nav.Link>
            <Nav.Link eventKey="messages" onClick={() => handleClick("messages")}>Messages</Nav.Link>
            <Nav.Link eventKey="reviews" onClick={() => handleClick("reviews")}>Reviews</Nav.Link>
            <Nav.Link eventKey="blog" onClick={() => handleClick("blog")}>Blog</Nav.Link>
            <Nav.Link eventKey="setting" onClick={() => handleClick("setting")}>Setting</Nav.Link>
            <Nav.Link eventKey="notifications" onClick={() => handleClick("notifications")}>Notifications</Nav.Link>
            <Nav.Link onClick={() => { logout(); navigate("/"); }}>Log Out</Nav.Link>
        </Nav>

    );
}


export default SellerAccountTabs;