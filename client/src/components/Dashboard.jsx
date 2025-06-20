import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";

function Dashboard() {
    const {user} = useUser()
    const [name, setName] = useState(user.data.name);
    const [email, setEmail] = useState(user.data.email);

    function handleChange(e) {
        if (e.target.name === "name") {
            setName(e.target.value);
        } else if (e.target.name === "email") {
            setEmail(e.target.value);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        const newData = { id: user.data.id };
        if (formDataObj.name !== user.data.name) {
            newData.name = formDataObj.name;
        }
        if (formDataObj.email !== user.data.email) {
            newData.email = formDataObj.email;
        }
        if (formDataObj.password !== "" || formDataObj.confirmPassword !== "") {
            newData.password = formDataObj.password;
            newData.confirmPassword = formDataObj.confirmPassword;
        }
        const response = await fetch(`${API_BASE_URL}/user/updateuser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData)
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.error);
        } else {
            alert("User data updated successfully");
        }

    }
    return (
        <div className="d-flex ">
            <div style={{ width: "100%" }}>
                <Form className="d-flex flex-column gap-3" controlId="update" onSubmit={handleUpdate}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control name="name" type="text" placeholder="Enter Full Name" value={name} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control name="email" type="email" placeholder="Enter email" value={email} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Change Password</Form.Label>
                        <Form.Control name="password" type="password" placeholder="Password" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control name="confirmPassword" type="password" placeholder="Confirm Password" />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Update
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default Dashboard;