import React from "react";
import SelesChart from "./SalesChart";
import Dashboard from "./Dashboard";
import Accordion from 'react-bootstrap/Accordion';
import { useTranslation } from 'react-i18next';

function SellerDashboard() {
    const { t } = useTranslation('sellerDashboard');
    return (
        <div className="d-flex flex-column gap-3">
            <SelesChart />
            <Accordion defaultActiveKey={null}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{t('updateInfo')}</Accordion.Header>
                    <Accordion.Body>
                        <Dashboard />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}

export default SellerDashboard;