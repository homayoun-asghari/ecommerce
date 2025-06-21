import "../styles/Categories.css";
import React from "react";
import { useTranslation } from 'react-i18next';
import Nav from "react-bootstrap/Nav";
import { useAccountTab } from "../contexts/AccountTabContext";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function SellerAccountTabs() {
    const { t } = useTranslation('account');
    const { activeTab, setActiveTab } = useAccountTab();
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleClick = (tab) => {
        setActiveTab(tab);
    };

    const tabs = [
        { key: 'dashboard' },
        { key: 'products' },
        { key: 'orders' },
        { key: 'payment' },
        { key: 'wishlist' },
        { key: 'cart' },
        { key: 'address' },
        { key: 'tickets' },
        { key: 'notifications' }
    ];

    const getTabLabel = (key) => {
        if (key === 'payment') {
            return t('seller.payment');
        }
        return t(`tabs.${key}`);
    };

    return (
        <Nav className="flex-column" variant="underline" activeKey={activeTab}>
            {tabs.map(tab => (
                <Nav.Link 
                    key={tab.key}
                    eventKey={tab.key}
                    onClick={() => handleClick(tab.key)}
                >
                    {getTabLabel(tab.key)}
                </Nav.Link>
            ))}
            <Nav.Link onClick={() => { logout(); navigate("/"); }}>
                {t('tabs.logout')}
            </Nav.Link>
        </Nav>
    );
}

export default React.memo(SellerAccountTabs);