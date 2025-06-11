import React, { useState, useEffect } from "react";
import AddresseCard from "../components/AddressCard";
import { useUser } from "../contexts/UserContext";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function Addresses() {
    const { user } = useUser();
    const userId = user.data.id;
    const [addresses, setAddresses] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [formData, setFormData] = useState({});
    const [address, setAddress] = useState('');
    const [markerPosition, setMarkerPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;


    const containerStyle = {
        width: '100%',
        height: '300px',
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            const response = await fetch(`http://localhost:5050/address?userId=${userId}`);
            const data = await response.json();
            if (response.ok) {
                setAddresses(data);
            }
        };
        fetchAddresses();
    }, [userId]);

    const handleMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const place = results[0];
                setAddress(place.formatted_address);

                const addressComponents = place.address_components;
                const getComponent = (type) => {
                    const comp = addressComponents.find(c => c.types.includes(type));
                    return comp ? comp.long_name : "";
                };

                const newForm = {
                    street: `${getComponent("street_number")} ${getComponent("route")}`.trim(),
                    city: getComponent("locality"),
                    state: getComponent("administrative_area_level_1"),
                    postal_code: getComponent("postal_code"),
                    country: getComponent("country")
                };

                setFormData(prev => ({ ...prev, ...newForm }));
            } else {
                console.error("Geocoder failed:", status);
            }
        });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        if (formDataObj.is_default === "on") formDataObj.is_default = true;

        const response = await fetch(`http://localhost:5050/address?userId=${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            handleClose();
            window.location.reload();
        } else {
            alert(data.error);
        }
    }

    return (
        <div className="d-flex flex-column justify-content-end">
            <Button variant="primary" onClick={handleShow}>
                Add New Address
            </Button>

            <Modal show={show} onHide={handleClose} centered >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Address</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <LoadScript
                        googleMapsApiKey={apiKey}
                        libraries={["places"]}
                    >
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapCenter}
                            zoom={2}
                            onClick={handleMapClick}
                        >
                            {markerPosition && <Marker position={markerPosition} draggable={true} onDragEnd={(e) => handleMapClick(e)}/>}
                        </GoogleMap>
                        <p className="mt-2">Selected Address: {address}</p>
                    </LoadScript>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control type="text" name="full_name" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Street</Form.Label>
                            <Form.Control
                              type="text"
                              name="street"
                              value={formData.street || ""}
                              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                              required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={formData.city || ""}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={formData.state || ""}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              type="text"
                              name="postal_code"
                              value={formData.postal_code || ""}
                              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                              required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                              type="text"
                              name="country"
                              value={formData.country || ""}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control type="text" name="phone" required />
                        </Form.Group>
                        <Form.Check type="checkbox" name="is_default" label="Default" />

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Address
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {addresses.map((address, index) => (
                <div key={index}>
                    <AddresseCard address={address} mode = "page"/>
                </div>
            ))}
        </div>
    );
}

export default Addresses;
