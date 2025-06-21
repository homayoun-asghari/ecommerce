import React, { useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

function Dashboard() {
    const { t } = useTranslation('dashboard');
    const { user } = useUser();
    const [name, setName] = useState(user?.data?.name || '');
    const [email, setEmail] = useState(user?.data?.email || '');

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
            toast.error(data.error || t('form.updateError'));
        } else {
            toast.success(t('form.updateSuccess'));
        }

    }
    return (
        <div className="d-flex ">
            <div style={{ width: "100%" }}>
                <Form className="d-flex flex-column gap-3" controlId="update" onSubmit={handleUpdate}>
                    <h4 className="mb-4">{t('title')}</h4>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t('form.fullName')}</Form.Label>
                        <Form.Control 
                            name="name" 
                            type="text" 
                            placeholder={t('form.fullNamePlaceholder')} 
                            value={name} 
                            onChange={handleChange} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>{t('form.email')}</Form.Label>
                        <Form.Control 
                            name="email" 
                            type="email" 
                            placeholder={t('form.emailPlaceholder')} 
                            value={email} 
                            onChange={handleChange} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>{t('form.changePassword')}</Form.Label>
                        <Form.Control 
                            name="password" 
                            type="password" 
                            placeholder={t('form.passwordPlaceholder')} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>{t('form.confirmPassword')}</Form.Label>
                        <Form.Control 
                            name="confirmPassword" 
                            type="password" 
                            placeholder={t('form.confirmPasswordPlaceholder')} 
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                        {t('form.updateButton')}
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default Dashboard;