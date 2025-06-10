import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useUser } from "../contexts/UserContext";

function NewArrivals() {
    const [products, setProducts] = useState([]);
    const { user } = useUser();
    const userId = user?.data?.id;

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("http://192.168.1.106:5050/product/newarrivals");
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching new arrivals:", err);
            }
        }

        fetchProducts();
    }, []);

    return (
        <Row className="g-1">
            <Row className="d-flex justify-content-between align-items-center mb-3">
                <Col>
                    <h5>New Arrivals</h5>
                </Col>
                <Col className="text-end">
                    <Link to="/shop" className="btn btn-outline-primary text-nowrap">
                        View All
                    </Link>
                </Col>
            </Row>
            <div className="scroll-wrapper">
                {products.map((product) => (
                    <Col key={product.id} >
                        <div className="card-wrapper">
                            <ProductCard product={product} userId={userId} />
                        </div>
                    </Col>
                ))}
            </div>
        </Row>
    );
}

export default NewArrivals;
