import React from "react";
import Categories from "./Categories";
import AccountSideBar from "./AccountSideBar";
import { useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import FilterSideBar from "./FilterSideBar";

function SideBar() {
  const location = useLocation();
  const { user } = useUser();

  if (location.pathname === "/account" && user) {
    return <AccountSideBar />;
  } else if (location.pathname === "/shop") {
    return <FilterSideBar />;
  }else if (location.pathname === "/search") {
    return <FilterSideBar />;
  } else {
    return <Categories />;
  }
}

export default SideBar;
