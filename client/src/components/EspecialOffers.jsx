import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "./ProductCard";
import "../styles/EspecialOffers.css";
import Countdown from "./Countdown";
import { Link } from "react-router-dom";


function EspecialOffers(props) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`http://192.168.1.106:5050/products/especialoffers?discount=${props.discount}`);
                const data = await response.json();
                setProducts(data);
                console.log("Fetched products:", data);
            } catch (err) {
                console.error("Error fetching special offers:", err);
            }
        }
        fetchProducts();
    }, [props.discount]);


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
                            <ProductCard product={product} />
                        </div>
                    </Col>
                ))}
            </Col>

        </Row>
    );
}

export default EspecialOffers;
