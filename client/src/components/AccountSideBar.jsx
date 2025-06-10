import "../styles/Categories.css";
import React from "react";
import Accordion from 'react-bootstrap/Accordion';
import { useSideBar } from "../contexts/SideBarContext";
import { useUser } from "../contexts/UserContext";
import PersonIcon from '@mui/icons-material/Person';
import AccountTabs from "./AccountTabs.jsx";
import SellerAccountTabs from "./SellerAccountTabs.jsx";

function Categories() {
    const { setIsOpen } = useSideBar();
    const { user} = useUser();
    const userName = user?.data?.name;
    const userRole = user?.data?.role;

    function handleClose() {
        setIsOpen(prev => !prev);
    }

    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header id="all" onClick={handleClose}>
                            <div className="d-flex align-items-center gap-1">
                                <PersonIcon style={{ fontSize: 20 }} />
                                <p>{userName}</p>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className="accordion-dropdown">
                            {userRole === "buyer" && <AccountTabs />}
                            {userRole === "seller" && <SellerAccountTabs />}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
}


export default Categories;