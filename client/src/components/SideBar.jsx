import React, {useState} from "react";
import Categories from "./Categories";
import AccountSideBar from "./AccountSideBar";
import { useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import FilterSideBar from "./FilterSideBar";

function SideBar() {
  const location = useLocation();
  const {user} = useUser();

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
        ...prev,
        ...newFilters
    }));
};

 // Filter state
    const [filters, setFilters] = useState({
        categories: [],
        minRating: 0,
        priceRange: { min: 0, max: 1000 }
    });

    const [categories, setCategories] = useState([]);

  if (location.pathname === "/account" && user) {
    return <AccountSideBar />
  } else if (location.pathname === "/shop") {
    return <FilterSideBar 
    categories={categories}
    onFilterChange={handleFilterChange}
    filters={filters}
/>
  } else {
    return <Categories />;
  }
}

export default SideBar;
