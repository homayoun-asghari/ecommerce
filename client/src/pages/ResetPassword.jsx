import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    async function handleReset(e){
        e.preventDefault();
        const formData = new FormData(e.target);

        const formDataObj = Object.fromEntries(formData.entries());

        const response = await fetch(`http://192.168.1.106:5050/resetpassword?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if (response.status === 400) {
            alert(data.error);
        } else if (response.status === 200) {
            navigate("/account");
        }
    }
    return (
        <div className="d-flex justify-content-center " style={{ minHeight: "80vh" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
                <Form className="d-flex flex-column gap-3" controlId="register" onSubmit={handleReset}>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control name="password" type="password" placeholder="Password" required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control name="confirmPassword" type="password" placeholder="Confirm Password" required />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default ResetPassword;