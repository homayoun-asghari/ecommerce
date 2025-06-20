import React, { useState } from "react";
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Google } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {useTheme} from "../contexts/ThemeContext"
import { API_BASE_URL } from "../config";

function LoginRegister(props) {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState(localStorage.getItem("email"));
    const [password, setPassword] = useState(localStorage.getItem("password"));
    const {mode} = useTheme();

    const navigate = useNavigate();

    function handelChange(e) {
        if (e.target.name === "email") setEmail(e.target.value);
        if (e.target.name === "password") setPassword(e.target.value);
    }

    async function handleRegister(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        const formDataObj = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if (response.status === 400) {
            alert(data.error);
        } else if (response.status === 201) {
            alert("User registered successfully");
            window.location.reload();
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const formDataObj = Object.fromEntries(formData.entries());

        if (formDataObj.remember) {
            localStorage.setItem("email", formDataObj.email);
            setEmail(formDataObj.email);
            localStorage.setItem("password", formDataObj.password);
            setPassword(formDataObj.password);
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if (response.status === 400) {
            alert(data.error);
        } else if (response.status === 201) {
            localStorage.setItem("token", data.token);
            window.location.reload();
        }
    }

    async function handleForget(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const formDataObj = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_BASE_URL}/auth/forgetpassword`, {
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
            console.log("here");
            alert("Password Reset Link Sent To Your Email.");
        }
    }

    async function handleRole(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        const response = await fetch(`${API_BASE_URL}/user/updaterole?id=${props.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            navigate(`/account?token=${data.token}`);
            alert("User Loged in successfully");
        }
    }

    async function handleReset(e){
        e.preventDefault();
        const formData = new FormData(e.target);

        const formDataObj = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_BASE_URL}/auth/resetpassword?token=${props.reset}`, {
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

    if (props.id) {
        return (
            <div className="d-flex justify-content-center" style={{ minHeight: "80vh" }}>
                <div style={{ width: "100%", maxWidth: "400px" }}>
                    <Form className="d-flex flex-column gap-3" onSubmit={handleRole}>
                        <Form.Group className="mb-3">
                            <Form.Select name="role" required>
                                <option value="">You are ...</option>
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">Submit</Button>
                    </Form>
                </div>
            </div>
        );
    }


    if (props.reset) {
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

    return (
        <Row>
            <Nav className="d-flex justify-content-center align-items-center" variant="underline" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                <Nav.Item>
                    <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="register">Register</Nav.Link>
                </Nav.Item>
            </Nav>

            {activeTab === 'login' && (
                <div className="d-flex justify-content-center" style={{ minHeight: "80vh" }}>
                    <div style={{ width: "100%", maxWidth: "400px" }}>
                        <Form className="d-flex flex-column gap-3" onSubmit={handleLogin}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control name="email" type="email" placeholder="Enter email" value={email} onChange={handelChange} required />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="password" type="password" placeholder="Password" value={password} onChange={handelChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="remember">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Check name="remember" type="checkbox" label="Remember me" />

                                    <Nav activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                                        <Nav.Item>
                                            <Nav.Link eventKey="forget">Forget Password?</Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                </div>
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>

                            <Link className={mode ? "btn btn-dark" : "btn btn-light"} to={`${API_BASE_URL}/auth/google`}>
                                <Google size={24} /> Continue with Google
                            </Link>
                        </Form>
                    </div>
                </div>
            )}

            {activeTab === 'register' && (
                <div className="d-flex justify-content-center " style={{ minHeight: "80vh" }}>
                    <div style={{ width: "100%", maxWidth: "400px" }}>
                        <Form className="d-flex flex-column gap-3" controlId="register" onSubmit={handleRegister}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control name="name" type="text" placeholder="Enter Full Name" required />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control name="email" type="email" placeholder="Enter email" required />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="password" type="password" placeholder="Password" required />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control name="confirmPassword" type="password" placeholder="Confirm Password" required />
                            </Form.Group>

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

                            <Link className={mode ? "btn btn-dark" : "btn btn-light"}  to={`${API_BASE_URL}/auth/google`}>
                                <Google size={24} /> Continue with Google
                            </Link>
                        </Form>
                    </div>
                </div>
            )}

            {activeTab === 'forget' && (
                <div className="d-flex justify-content-center" style={{ minHeight: "80vh" }}>
                    <div style={{ width: "100%", maxWidth: "400px" }}>
                        <Form className="d-flex flex-column gap-3" onSubmit={handleForget}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control name="email" type="email" placeholder="Enter email" value={email} onChange={handelChange} />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </div>
                </div>
            )}

        </Row >
    );
}


export default LoginRegister;