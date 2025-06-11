import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import LoginRegister from "../components/LoginRegister";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dashboard from "../components/Dashboard";
import Orders from "../components/Orders";
import WishList from "../components/WishList";
import Addresses from "../components/Addresses";
import Cart from "../pages/Cart";
import Tickets from "../components/Tickets";
import Notifications from "../components/Notifications";
import { useAccountTab } from "../contexts/AccountTabContext";
import { useSideBar } from "../contexts/SideBarContext";
import SellerDashboard from "../components/SellerDashboard";
import AddProducts from "../components/AddProducts";
import SellerOrders from "../components/SellerOrders";
import SellerPayment from "../components/SellerPayment";

function Account() {
  const [searchParams] = useSearchParams();
  const resetPassword = searchParams.get("resetpassword");
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const { user, authorized, logout } = useUser();
  const { activeTab, setActiveTab } = useAccountTab();
  const { isOpen } = useSideBar();
  const tabFromURL = searchParams.get("tab");

  useEffect(() => {
    if (tabFromURL) setActiveTab(tabFromURL);
  }, [tabFromURL]);

  if (!authorized) {
    return <LoginRegister id={id} reset={resetPassword} />;
  }

  const role = user?.data?.role;

  if (role === "buyer") {
    return (
      <Row>
        <Col lg={isOpen ? 3 : 0}></Col>
        <Col lg={isOpen ? 9 : 12}>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "wishlist" && <WishList />}
          {activeTab === "cart" && <Cart />}
          {activeTab === "address" && <Addresses />}
          {activeTab === "tickets" && <Tickets />}
          {activeTab === "notifications" && <Notifications />}
        </Col>
      </Row>
    );
  } else if (role === "seller") {
    return (
      <Row>
        <Col lg={isOpen ? 3 : 0}></Col>
        <Col lg={isOpen ? 9 : 12}>
          {activeTab === "dashboard" && <SellerDashboard />}
          {activeTab === "products" && <AddProducts />}
          {activeTab === "orders" && <SellerOrders />}
          {activeTab === "payment" && <SellerPayment />}
          {activeTab === "wishlist" && <WishList />}
          {activeTab === "cart" && <Cart />}
          {activeTab === "address" && <Addresses />}
          {activeTab === "tickets" && <Tickets />}
          {activeTab === "notifications" && <Notifications />}
        </Col>
      </Row>
    );
  } else if (role === "admin") {
    return (
      <Row>
        <Col lg={isOpen ? 3 : 0}></Col>
        <Col lg={isOpen ? 9 : 12}>
          <h1>Welcome {user.data.name} - you are an admin</h1>
          {activeTab === "dashboard"}
          {activeTab === "users"}
          {activeTab === "products"}
          {activeTab === "orders"}
          {activeTab === "payment"}
          {activeTab === "tickets"}
          {activeTab === "reviews"}
          {activeTab === "blog"}
          {activeTab === "notifications"}
          {activeTab === "setting"}
        </Col>
      </Row>
    );
  }

  return null;
}

export default Account;
