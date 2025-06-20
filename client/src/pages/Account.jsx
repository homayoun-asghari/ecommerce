import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import LoginRegister from "../components/LoginRegister";
import Col from "react-bootstrap/Col";
import styled from "styled-components";
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
import AdminDashboard from "../components/AdminDashboard";
import AdminUsers from "../components/AdminUsers";
import AdminProducts from "../components/AdminProducts";
import AdminOrders from "../components/AdminOrders";
import AdminPayments from "../components/AdminPayments";
import AdminTickets from "../components/AdminTickets";
import AdminReviews from "../components/AdminReviews";
import AdminNotifications from "../components/AdminNotifications";
import AdminBlog from "../components/AdminBlog";
import AdminSettings from "../components/AdminSettings";
import AdminMessages from "../components/AdminMessages";

const ContentColumn = styled(Col)`
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  width: 100%;
  padding: 0 15px;
  
  @media (min-width: 998px) {
    margin-left: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    width: ${({ $isOpen }) => ($isOpen ? 'calc(100% - 300px)' : '100%')};
  }
`;

function Account() {
  const [searchParams] = useSearchParams();
  const resetPassword = searchParams.get("resetpassword");
  const id = searchParams.get("id");
  const { user, authorized} = useUser();
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
      <ContentColumn $isOpen={isOpen}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "orders" && <Orders />}
        {activeTab === "wishlist" && <WishList />}
        {activeTab === "cart" && <Cart />}
        {activeTab === "address" && <Addresses />}
        {activeTab === "tickets" && <Tickets />}
        {activeTab === "notifications" && <Notifications />}
      </ContentColumn>
    );
  } else if (role === "seller") {
    return (
      <ContentColumn $isOpen={isOpen}>
        {activeTab === "dashboard" && <SellerDashboard />}
        {activeTab === "products" && <AddProducts />}
        {activeTab === "orders" && <SellerOrders />}
        {activeTab === "payment" && <SellerPayment />}
        {activeTab === "wishlist" && <WishList />}
        {activeTab === "cart" && <Cart />}
        {activeTab === "address" && <Addresses />}
        {activeTab === "tickets" && <Tickets />}
        {activeTab === "notifications" && <Notifications />}
      </ContentColumn>
    );
  } else if (role === "admin") {
    return (
      <ContentColumn $isOpen={isOpen}>
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "payment" && <AdminPayments />}
        {activeTab === "tickets" && <AdminTickets />}
        {activeTab === "messages" && <AdminMessages />}
        {activeTab === "reviews" && <AdminReviews />}
        {activeTab === "blog" && <AdminBlog />}
        {activeTab === "notifications" && <AdminNotifications />}
        {activeTab === "setting" && <AdminSettings />}
      </ContentColumn>
    );
  }

  return null;
}

export default Account;
