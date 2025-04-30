import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginRegister from '../components/LoginRegister';

function Account() {
    const [authorized, setAuthorized] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    if (searchParams.get('token')) {
        localStorage.setItem("token", searchParams.get('token'));
    }

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5050/account", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setAuthorized(true);
                setUser(data);
            } else {
                setAuthorized(false);
            }
        };

        fetchProfile();
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    if (authorized === true) {
        return (
            <div>
                <h1>Welcome {user.data.name} to your account page</h1>
                <button onClick={handleLogout}>logout</button>
            </div>
        );
    } else {
        return <LoginRegister />
    }
}

export default Account;
