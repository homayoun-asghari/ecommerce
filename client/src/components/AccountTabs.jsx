import "../styles/Categories.css";
import React from "react";
import { useTranslation } from 'react-i18next';
import Nav from "react-bootstrap/Nav";
import { useAccountTab } from "../contexts/AccountTabContext";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function AccountTabs() {
    const { t } = useTranslation('account');
    const { activeTab, setActiveTab } = useAccountTab();
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleClick = (tab) => {
        setActiveTab(tab);
    };

    const tabs = [
        { key: 'dashboard' },
        { key: 'orders' },
        { key: 'wishlist' },
        { key: 'cart' },
        { key: 'address' },
        { key: 'tickets' },
        { key: 'notifications' }
    ];

    return (
        <Nav className="flex-column" variant="underline" activeKey={activeTab}>
            {tabs.map(tab => (
                <Nav.Link 
                    key={tab.key}
                    eventKey={tab.key} 
                    onClick={() => handleClick(tab.key)}
                >
                    {t(`tabs.${tab.key}`)}
                </Nav.Link>
            ))}
            <Nav.Link onClick={() => { logout(); navigate("/"); }}>
                {t('tabs.logout')}
            </Nav.Link>
        </Nav>
    );
}

export default React.memo(AccountTabs);