import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import { useSideBar } from "../contexts/SideBarContext";
import { API_BASE_URL } from "../config";
import AddresseCard from "../components/AddressCard";
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

function Checkout() {
    const [createAccount, setCreateAccount] = useState(false);
    const [differentShipping, setDifferentShipping] = useState(false);
    // Using a single state to control the form visibility
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState({});
    const [delivary, setDelivary] = useState(false);
    const [shipping, setShipping] = useState(null);
    
    // Debug log when component mounts and when relevant states change
    useEffect(() => {
        console.log('Checkout component state:', {
            differentShipping,
            showShippingForm,
            hasAddresses: addresses?.length > 0
        });
    }, [differentShipping, showShippingForm, addresses]);

    const { cartItems, removeFromCart } = useCart();
    let totalCost = 0;
    const delivaryCost = 15;
    const { user } = useUser();
    const userId = user?.data?.id;

    const { isOpen } = useSideBar();
    const { t } = useTranslation('checkout');
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
            const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
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
            const response = await fetch(`${API_BASE_URL}/address?userId=${userId}`);
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
        <ContentColumn $isOpen={isOpen}>
            <Row>
                <Col lg={8}>
                {user && (
                    <Form id="checkout" onSubmit={handleSubmit}>
                        <AddresseCard address={address} />
                        <div className="mb-3">
                            <Form.Check 
                                type="checkbox" 
                                id="differentShippingCheckbox"
                                name="differentShipping" 
                                label="Ship to different address?" 
                                checked={differentShipping}
                                onChange={(e) => {
                                    console.log('Checkbox changed:', e.target.checked);
                                    const isChecked = e.target.checked;
                                    setDifferentShipping(isChecked);
                                    setShowShippingForm(isChecked);
                                }} 
                            />
                        </div>
                        {showShippingForm && (
                            <div className="shipping-addresses mt-3">
                                {addresses.filter(addr => !addr.is_default).length > 0 ? (
                                    addresses
                                        .filter(addr => !addr.is_default)
                                        .map(item => (
                                            <div key={item.id} className="mb-3 p-3 border rounded">
                                                <AddresseCard address={item} />
                                                <Form.Check 
                                                    type="radio" 
                                                    name="shipping" 
                                                    label={t('form.shipToThisAddress')} 
                                                    onChange={e => handleShipping(item.id)}
                                                    className="mt-2"
                                                />
                                            </div>
                                        ))
                                ) : (
                                    <div className="alert alert-info">
                                        {t('form.noAdditionalAddresses')}
                                    </div>
                                )}
                            </div>
                        )}
                    </Form>
                )}
                {!user && <><h4 className="border-bottom py-1">{t('billingData')}</h4>
                    <Form id="checkout" className="d-flex flex-column gap-3" controlId="checkout" onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>{t('form.fullName')}</Form.Label>
                            <Form.Control name="name" type="text" placeholder={t('form.fullName')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>{t('form.email')}</Form.Label>
                            <Form.Control name="email" type="email" placeholder={t('form.email')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="street">
                            <Form.Label>{t('form.street')}</Form.Label>
                            <Form.Control type="text" name="street" placeholder={t('form.street')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="city">
                            <Form.Label>{t('form.city')}</Form.Label>
                            <Form.Control type="text" name="city" placeholder={t('form.city')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="state">
                            <Form.Label>{t('form.state')}</Form.Label>
                            <Form.Control type="text" name="state" placeholder={t('form.state')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="postal_code">
                            <Form.Label>{t('form.postalCode')}</Form.Label>
                            <Form.Control type="text" name="postal_code" placeholder={t('form.postalCode')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="country">
                            <Form.Label>{t('form.country')}</Form.Label>
                            <Form.Control type="text" name="country" placeholder={t('form.country')} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>{t('form.phone')}</Form.Label>
                            <Form.Control type="text" name="phone" placeholder={t('form.phone')} required />
                        </Form.Group>
                        <Form.Check 
                            type="checkbox" 
                            name="createAccount" 
                            label={t('form.createAccount')} 
                            onChange={(e) => setCreateAccount(e.target.checked)} 
                        />

                        {createAccount && (
                            <>
                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>{t('form.password')}</Form.Label>
                                    <Form.Control name="password" type="password" placeholder={t('form.password')} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="confirmPassword">
                                    <Form.Label>{t('form.confirmPassword')}</Form.Label>
                                    <Form.Control name="confirmPassword" type="password" placeholder={t('form.confirmPassword')} required />
                                </Form.Group>
                            </>
                        )}

                        <div className="mb-3">
                            <Form.Check 
                                type="checkbox" 
                                id="guestDifferentShippingCheckbox"
                                name="differentShipping" 
                                label="Ship to different address?" 
                                checked={differentShipping}
                                onChange={(e) => {
                                    console.log('Guest checkbox changed:', e.target.checked);
                                    const isChecked = e.target.checked;
                                    setDifferentShipping(isChecked);
                                    setShowShippingForm(isChecked);
                                }} 
                            />
                        </div>

                        {showShippingForm && (
                            <>
                                <h4 className="border-bottom py-1">{t('shippingData')}</h4>
                                <Form.Group className="mb-3" controlId="shippingName">
                                    <Form.Label>{t('form.fullName')}</Form.Label>
                                    <Form.Control name="shippingName" type="text" placeholder={t('form.fullName')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingStreet">
                                    <Form.Label>{t('form.street')}</Form.Label>
                                    <Form.Control type="text" name="shippingStreet" placeholder={t('form.street')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingCity">
                                    <Form.Label>{t('form.city')}</Form.Label>
                                    <Form.Control type="text" name="shippingCity" placeholder={t('form.city')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingState">
                                    <Form.Label>{t('form.state')}</Form.Label>
                                    <Form.Control type="text" name="shippingState" placeholder={t('form.state')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingPostal_code">
                                    <Form.Label>{t('form.postalCode')}</Form.Label>
                                    <Form.Control type="text" name="shippingPostal_code" placeholder={t('form.postalCode')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingCountry">
                                    <Form.Label>{t('form.country')}</Form.Label>
                                    <Form.Control type="text" name="shippingCountry" placeholder={t('form.country')} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="shippingPhone">
                                    <Form.Label>{t('form.phone')}</Form.Label>
                                    <Form.Control type="text" name="shippingPhone" placeholder={t('form.phone')} required />
                                </Form.Group>
                            </>
                        )}

                    </Form> </>}
            </Col>

            <Col lg={4}>
                <Card border="success">
                    <Card.Header>{t('yourOrder')}</Card.Header>
                    <Card.Body className="d-flex flex-column">
                        <Card.Title>{t('products')}</Card.Title>

                        {cartItems.map((item, index) => (
                            <Card.Text key={index} className="d-flex justify-content-between">
                                <span>{item.name}</span>
                                <span style={{ fontWeight: "bold" }}>x {item.quantity}</span>
                                <span>{item.price * item.quantity}</span>
                            </Card.Text>
                        ))}

                        <Card.Text className="d-flex justify-content-between border-top py-3">
                            <span>{t('subtotal')}</span>
                            <span>{totalCost}</span>
                        </Card.Text>

                        <Card.Text
                            className="d-flex justify-content-between border-top py-3 gap-3"
                            ref={shippingRef}
                        >
                            <span>{t('shipping')}</span>
                            <Form.Check 
                                type="radio" 
                                name="shippingMethod" 
                                label={t('shippingMethods.flatRate')} 
                                value="flat" 
                                onChange={(e) => setDelivary(prev => !prev)} 
                            />
                            <Form.Check 
                                type="radio" 
                                name="shippingMethod" 
                                label={t('shippingMethods.localPickup')} 
                                value="pickup" 
                                onChange={(e) => setDelivary(prev => !prev)}
                            />
                        </Card.Text>

                        <Card.Text className="d-flex justify-content-between border-top py-3">
                            <span>{t('total')}</span>
                            <span>{delivary ? (totalCost += delivaryCost) : totalCost}</span>
                        </Card.Text>

                        <Card.Text className="d-flex flex-column border-top py-3 gap-3" ref={paymentRef}>
                            <span>{t('payment')}</span>
                            <Form.Check 
                                type="radio" 
                                name="paymentMethod" 
                                label={t('paymentMethods.bank')} 
                                value="bank" 
                            />
                            <Form.Check 
                                type="radio" 
                                name="paymentMethod" 
                                label={t('paymentMethods.check')} 
                                value="check" 
                            />
                            <Form.Check 
                                type="radio" 
                                name="paymentMethod" 
                                label={t('paymentMethods.cash')} 
                                value="cash" 
                            />
                        </Card.Text>

                        <Card.Text className="d-flex flex-column border-top py-3 gap-3" ref={termsRef}>
                            <Form.Check
                                type="checkbox"
                                label={t('form.terms')}
                            />
                        </Card.Text>

                        <Button variant="success" type="submit" form="checkout" disabled={!isValid}>
                            {t('placeOrder')}
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </ContentColumn>
  );
}

export default Checkout;