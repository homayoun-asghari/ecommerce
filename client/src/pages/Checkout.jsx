import React, { useState, useEffect, useRef } from "react";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import AddresseCard from "../components/AddressCard";
import Card from 'react-bootstrap/Card';

function Checkout() {
    const [createAccount, setCreateAccount] = useState(false);
    const [differentShipping, setDifferentShipping] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState({});
    const [delivary, setDelivary] = useState(false);
    const [shipping, setShipping] = useState(null);
    const { cartItems, removeFromCart } = useCart();
    let totalCost = 0;
    const delivaryCost = 15;
    const { user } = useUser();
    const userId = user?.data?.id;

    // Inside your component:
    const [isValid, setIsValid] = useState(false);
    const shippingRef = useRef(null);
    const paymentRef = useRef(null);
    const termsRef = useRef(null);

    for (const item of cartItems) {
        totalCost += item.quantity * item.price;
    }

    useEffect(() => {
        if (address?.id) {
            setShipping(address.id);
        }
    }, [address]);

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        formDataObj.cart = cartItems;
        formDataObj.userId = userId || null;
        formDataObj.addressId = shipping;
        const selectedShipping = shippingRef.current.querySelector('input[name="shippingMethod"]:checked')?.value;
        formDataObj.shipping = selectedShipping || null;

        try {
            const response = await fetch("http://localhost:5050/cart/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataObj)
            });

            const data = await response.json();

            if (response.ok) {
                cartItems.map(item => removeFromCart(item.id));
                alert(data.message);
                
            } else {
                alert(data.error);
            }

        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchAddresses = async () => {
            const response = await fetch(`http://localhost:5050/addresses?userId=${userId}`);
            const data = await response.json();
            if (response.ok) {
                setAddresses(data);
                const found = data.find(item => item.is_default === true);
                setAddress(found);
            }
        };
        fetchAddresses();
    }, [userId]);

    function handleShipping(id) {
        setShipping(id);
    }

    useEffect(() => {
        const validate = () => {
            const shippingSelected = shippingRef.current?.querySelector('input[name="shippingMethod"]:checked');
            const paymentSelected = paymentRef.current?.querySelector('input[name="paymentMethod"]:checked');
            const termsChecked = termsRef.current?.querySelector('input[type="checkbox"]')?.checked;

            setIsValid(!!shippingSelected && !!paymentSelected && !!termsChecked);
        };

        document.addEventListener("change", validate);
        return () => document.removeEventListener("change", validate);
    }, []);


    return (
        <Row>
            <Col lg={8}>
                {user && <Form id="checkout" onSubmit={handleSubmit}>
                    <AddresseCard address={address} />
                    <Form.Check type="checkbox" name="differentShipping" label="Ship to different address?" onChange={(e) => setDifferentShipping(e.target.checked)} />
                    {differentShipping && addresses.map(item => {
                        return (
                            <>
                                {!item.is_default &&
                                    <>
                                        <AddresseCard address={item} />
                                        <Form.Check type="radio" name="shipping" label="Shipping To?" onChange={e => handleShipping(item.id)} />
                                    </>}
                            </>
                        );
                    })}
                </Form>}
                {!user && <><h4 className="border-bottom py-1">Billing Data</h4>
                    <Form id="checkout" className="d-flex flex-column gap-3" controlId="checkout" onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control name="name" type="text" placeholder="Enter Full Name" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control name="email" type="email" placeholder="Enter email" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="street">
                            <Form.Label>Street</Form.Label>
                            <Form.Control type="text" name="street" placeholder="Enter Address Here" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" name="city" placeholder="Enter City" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="state">
                            <Form.Label>State</Form.Label>
                            <Form.Control type="text" name="state" placeholder="Enter State" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="postal_code">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control type="text" name="postal_code" placeholder="Enter Postal Code" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="country">
                            <Form.Label>Country</Form.Label>
                            <Form.Control type="text" name="country" placeholder="Enter Country" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control type="text" name="phone" placeholder="Enter Phone Number" required />
                        </Form.Group>
                        <Form.Check type="checkbox" name="createAccount" label="Create an Account?" onChange={(e) => setCreateAccount(e.target.checked)} />

                        {createAccount && (
                            <>
                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control name="password" type="password" placeholder="Password" required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control name="confirmPassword" type="password" placeholder="Confirm Password" required />
                                </Form.Group>
                            </>
                        )}

                        <Form.Check type="checkbox" name="differentShipping" label="Ship to different address?" onChange={(e) => setDifferentShipping(e.target.checked)} />

                        {differentShipping && (
                            <>
                                <h4 className="border-bottom py-1">Shipping Data</h4>
                                <Form.Group className="mb-3" controlId="shippingName">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control name="shippingName" type="text" placeholder="Enter Full Name" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingStreet">
                                    <Form.Label>Street</Form.Label>
                                    <Form.Control type="text" name="shippingStreet" placeholder="Enter Address Here" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingCity">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control type="text" name="shippingCity" placeholder="Enter City" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingState">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control type="text" name="shippingState" placeholder="Enter State" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingPostal_code">
                                    <Form.Label>Postal Code</Form.Label>
                                    <Form.Control type="text" name="shippingPostal_code" placeholder="Enter Postal Code" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingCountry">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control type="text" name="shippingCountry" placeholder="Enter Country" required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingPhone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" name="shippingPhone" placeholder="Enter Phone Number" required />
                                </Form.Group>
                            </>
                        )}

                    </Form> </>}
            </Col>

            <Col lg={4}>
                <Card border="success">
                    <Card.Header>Your Order</Card.Header>
                    <Card.Body className="d-flex flex-column">
                        <Card.Title>Products</Card.Title>

                        {cartItems.map((item, index) => (
                            <Card.Text key={index} className="d-flex justify-content-between">
                                <span>{item.name}</span>
                                <span style={{ fontWeight: "bold" }}>x {item.quantity}</span>
                                <span>{item.price * item.quantity}</span>
                            </Card.Text>
                        ))}

                        <Card.Text className="d-flex justify-content-between border-top py-3">
                            <span>Subtotal</span>
                            <span>{totalCost}</span>
                        </Card.Text>

                        <Card.Text
                            className="d-flex justify-content-between border-top py-3 gap-3"
                            ref={shippingRef}
                        >
                            <span>Shipping</span>
                            <Form.Check type="radio" name="shippingMethod" label="Flat Rate: 15 $" value="flat" onChange={(e) => setDelivary(prev => !prev)} />
                            <Form.Check type="radio" name="shippingMethod" label="Local Pickup" value="pickup" onChange={(e) => setDelivary(prev => !prev)}/>
                        </Card.Text>

                        <Card.Text className="d-flex justify-content-between border-top py-3">
                            <span>Total</span>
                            <span>{delivary ? (totalCost += delivaryCost) : totalCost}</span>
                        </Card.Text>

                        <Card.Text className="d-flex flex-column border-top py-3 gap-3" ref={paymentRef}>
                            <span>Payment</span>
                            <Form.Check type="radio" name="paymentMethod" label="Direct Bank Payment" value="bank" />
                            <Form.Check type="radio" name="paymentMethod" label="Check Payment" value="check" />
                            <Form.Check type="radio" name="paymentMethod" label="Cash On Delivery" value="cash" />
                        </Card.Text>

                        <Card.Text className="d-flex flex-column border-top py-3 gap-3" ref={termsRef}>
                            <Form.Check
                                type="checkbox"
                                label="I have read and agree to the website terms and conditions"
                            />
                        </Card.Text>

                        <Button variant="success" type="submit" form="checkout" disabled={!isValid}>
                            Place Order
                        </Button>
                    </Card.Body>
                </Card>
            </Col>

        </Row>
    );
}

export default Checkout;