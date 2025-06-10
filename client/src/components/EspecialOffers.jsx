import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "./ProductCard";
import "../styles/EspecialOffers.css";
import Countdown from "./Countdown";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";


function EspecialOffers() {
    const [products, setProducts] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;
    const discount = 20;

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`http://192.168.1.106:5050/product/especialoffers?discount=${discount}`);
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching special offers:", err);
            }
        }
        fetchProducts();
    }, [discount]);


    return (
        <Row >
            <Col lg={4} className="d-flex flex-column justify-content-center align-items-center especial-offers-card gap-2 py-5">
                <div>
                    <h2>Special Offers</h2>
                </div>
                <Countdown />
                <Link to="/products/especialoffers" className="btn btn-outline-dark text-nowrap">
                    View All
                </Link>
            </Col>

            <Col lg={8} className="scroll-wrapper" style={{ backgroundColor: "var(--color-primary)", borderRadius: "0px" }}>
                {products.map((product) => (
                    <Col key={product.id} >
                        <div className="card-wrapper">
                            <ProductCard product={product} userId={userId} />
                        </div>
                    </Col>
                ))}
            </Col>

        </Row>
    );
}

export default EspecialOffers;
