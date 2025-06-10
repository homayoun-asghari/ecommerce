import React from "react";
import SelesChart from "./SalesChart";
import Dashboard from "./Dashboard";
import Accordion from 'react-bootstrap/Accordion';

function SellerDashboard() {
    return (
        <div className="d-flex flex-column gap-3">
            <SelesChart />
            <Accordion defaultActiveKey={null}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Update Info</Accordion.Header>
                    <Accordion.Body>
                        <Dashboard />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}

export default SellerDashboard;