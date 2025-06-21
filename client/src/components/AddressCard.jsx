import React from "react";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { useUser } from "../contexts/UserContext";
import Button from 'react-bootstrap/Button';
import { Trash } from "react-bootstrap-icons";
import { API_BASE_URL } from "../config";

function AddressCard({ address = {}, mode = 'card' }) {
    const { user } = useUser();
    const userId = user?.data?.id;
    const setDefaultAddress = async (addressId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/address/setdefaultaddress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, addressId }),
            });

            if (response.ok) {
                window.location.reload(); // quick fix: reload to fetch updated default address
            } else {
                console.error("Failed to set default address");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/address/deleteaddress?addressId=${address.id}`);
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <Card className="m-3">
            <Card.Header>
                    Deliver to {address?.full_name || 'Unknown User'}
                </Card.Header>
            <Card.Body>
                <Card.Title>Address: {address?.street || ''} {address?.city || ''} {address?.state || ''} {address?.country || ''}</Card.Title>
                <Card.Text>
                    Phone: {address?.phone || 'Not provided'}
                </Card.Text>
                {mode === "page" && <div className="d-flex justify-content-between align-items-end">
                    <Form.Check
                        type="checkbox"
                        name="defaultAddress"
                        id={`default-${address.id}`}
                        label="Default"
                        checked={address?.is_default || false}
                        onChange={() => setDefaultAddress(address.id)}
                    />
                    <Button variant="danger" onClick={handleDelete}><Trash /></Button>
                </div>}
            </Card.Body>
        </Card>
    );
}

export default AddressCard;