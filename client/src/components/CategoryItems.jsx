import React, { useCallback } from "react";
import Accordion from 'react-bootstrap/Accordion';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';

function AccordionItems() {
    const { filters, updateFilters } = useFilters();
    const navigate = useNavigate();

    const handleCategoryClick = useCallback((e, category) => {
        e.preventDefault();
        const newCategories = [category]; // Always set the clicked category (toggle removed)
        
        updateFilters({ categories: newCategories });
        // Always navigate to /shop with the category filter
        navigate(`/shop?category=${category}`);
    }, [updateFilters, navigate]);

    const isCategoryActive = (category) => {
        return filters.categories.includes(category);
    };

    const renderCategoryLink = (to, label, category) => (
        <li>
            <a 
                href={to} 
                className={`text-decoration-none ${isCategoryActive(category) ? 'fw-bold' : 'text-body'}`}
                onClick={(e) => handleCategoryClick(e, category)}
            >
                {label}
            </a>
        </li>
    );

    return (
        <div>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Fruits & Vegetables</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=fresh-fruits", "Fresh Fruits", "fresh-fruits")}
                            {renderCategoryLink("/shop?category=fresh-vegetables", "Fresh Vegetables", "fresh-vegetables")}
                            {renderCategoryLink("/shop?category=organic-produce", "Organic Produce", "organic-produce")}
                            {renderCategoryLink("/shop?category=herbs-seasonings", "Herbs & Seasonings", "herbs-seasonings")}
                            {renderCategoryLink("/shop?category=cut-fruits", "Cut & Prepared Fruits", "cut-fruits")}
                            {renderCategoryLink("/shop?category=salad-kits", "Salad Kits", "salad-kits")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Meats & Seafood</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=beef", "Beef", "beef")}
                            {renderCategoryLink("/shop?category=chicken", "Chicken", "chicken")}
                            {renderCategoryLink("/shop?category=pork", "Pork", "pork")}
                            {renderCategoryLink("/shop?category=fish", "Fish", "fish")}
                            {renderCategoryLink("/shop?category=seafood", "Shrimp & Shellfish", "seafood")}
                            {renderCategoryLink("/shop?category=deli-meats", "Deli Meats", "deli-meats")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Dairy & Eggs</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=milk-cream", "Milk & Cream", "milk-cream")}
                            {renderCategoryLink("/shop?category=cheese", "Cheese", "cheese")}
                            {renderCategoryLink("/shop?category=yogurt", "Yogurt", "yogurt")}
                            {renderCategoryLink("/shop?category=butter", "Butter & Margarine", "butter")}
                            {renderCategoryLink("/shop?category=eggs", "Eggs", "eggs")}
                            {renderCategoryLink("/shop?category=dairy-alternatives", "Dairy Alternatives", "dairy-alternatives")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>Bakery & Bread</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=fresh-bread", "Fresh Bread", "fresh-bread")}
                            {renderCategoryLink("/shop?category=buns-rolls", "Buns & Rolls", "buns-rolls")}
                            {renderCategoryLink("/shop?category=breakfast-pastries", "Breakfast Pastries", "breakfast-pastries")}
                            {renderCategoryLink("/shop?category=cakes-cupcakes", "Cakes & Cupcakes", "cakes-cupcakes")}
                            {renderCategoryLink("/shop?category=cookies-brownies", "Cookies & Brownies", "cookies-brownies")}
                            {renderCategoryLink("/shop?category=gluten-free-bakery", "Gluten-Free Bakery", "gluten-free-bakery")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header>Beverages</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=water", "Water & Sparkling", "water")}
                            {renderCategoryLink("/shop?category=sodas", "Sodas & Soft Drinks", "sodas")}
                            {renderCategoryLink("/shop?category=coffee", "Coffee", "coffee")}
                            {renderCategoryLink("/shop?category=tea", "Tea", "tea")}
                            {renderCategoryLink("/shop?category=juices", "Juices & Drinks", "juices")}
                            {renderCategoryLink("/shop?category=energy-drinks", "Energy & Sports Drinks", "energy-drinks")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header>Frozen Foods</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=frozen-meals", "Frozen Meals", "frozen-meals")}
                            {renderCategoryLink("/shop?category=frozen-vegetables", "Frozen Vegetables", "frozen-vegetables")}
                            {renderCategoryLink("/shop?category=frozen-fruits", "Frozen Fruits", "frozen-fruits")}
                            {renderCategoryLink("/shop?category=ice-cream", "Ice Cream & Desserts", "ice-cream")}
                            {renderCategoryLink("/shop?category=frozen-breakfast", "Frozen Breakfast", "frozen-breakfast")}
                            {renderCategoryLink("/shop?category=frozen-snacks", "Frozen Appetizers & Snacks", "frozen-snacks")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header>Snacks & Candy</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {renderCategoryLink("/shop?category=chips", "Chips & Pretzels", "chips")}
                            {renderCategoryLink("/shop?category=cookies", "Cookies & Biscuits", "cookies")}
                            {renderCategoryLink("/shop?category=chocolate", "Chocolate & Candy", "chocolate")}
                            {renderCategoryLink("/shop?category=nuts-seeds", "Nuts & Seeds", "nuts-seeds")}
                            {renderCategoryLink("/shop?category=granola-bars", "Granola & Cereal Bars", "granola-bars")}
                            {renderCategoryLink("/shop?category=snack-mixes", "Popcorn & Snack Mixes", "snack-mixes")}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default AccordionItems;