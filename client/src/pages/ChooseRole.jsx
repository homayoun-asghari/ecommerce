import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate, useSearchParams } from "react-router-dom";

function ChooseRole() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    async function handleRole(e){        
        e.preventDefault();
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        const response = await fetch(`http://localhost:5050/updaterole?id=${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if(response.ok) {
            console.log("here");
            localStorage.setItem("token", data.token);
            navigate("/account");
            alert("User Loged in successfully");
        }
    }
    return (
        <div className="d-flex justify-content-center " style={{ minHeight: "80vh" }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
                <Form className="d-flex flex-column gap-3" controlId="register" onSubmit={handleRole}>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Select name="role" aria-label="You are ..." required>
                            <option value="">You are ...</option>
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                        </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default ChooseRole;