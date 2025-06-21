import React from "react";
import Accordion from 'react-bootstrap/Accordion';
import { Link } from 'react-router-dom';

function AccordionItems() {
    return (
        <div>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Fruits & Vegetables</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=fresh-fruits" className="text-decoration-none text-body">Fresh Fruits</Link></li>
                            <li><Link to="/shop?category=fresh-vegetables" className="text-decoration-none text-body">Fresh Vegetables</Link></li>
                            <li><Link to="/shop?category=organic-produce" className="text-decoration-none text-body">Organic Produce</Link></li>
                            <li><Link to="/shop?category=herbs-seasonings" className="text-decoration-none text-body">Herbs & Seasonings</Link></li>
                            <li><Link to="/shop?category=cut-fruits" className="text-decoration-none text-body">Cut & Prepared Fruits</Link></li>
                            <li><Link to="/shop?category=salad-kits" className="text-decoration-none text-body">Salad Kits</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Meats & Seafood</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=beef" className="text-decoration-none text-body">Beef</Link></li>
                            <li><Link to="/shop?category=chicken" className="text-decoration-none text-body">Chicken</Link></li>
                            <li><Link to="/shop?category=pork" className="text-decoration-none text-body">Pork</Link></li>
                            <li><Link to="/shop?category=fish" className="text-decoration-none text-body">Fish</Link></li>
                            <li><Link to="/shop?category=seafood" className="text-decoration-none text-body">Shrimp & Shellfish</Link></li>
                            <li><Link to="/shop?category=deli-meats" className="text-decoration-none text-body">Deli Meats</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Dairy & Eggs</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=milk-cream" className="text-decoration-none text-body">Milk & Cream</Link></li>
                            <li><Link to="/shop?category=cheese" className="text-decoration-none text-body">Cheese</Link></li>
                            <li><Link to="/shop?category=yogurt" className="text-decoration-none text-body">Yogurt</Link></li>
                            <li><Link to="/shop?category=butter" className="text-decoration-none text-body">Butter & Margarine</Link></li>
                            <li><Link to="/shop?category=eggs" className="text-decoration-none text-body">Eggs</Link></li>
                            <li><Link to="/shop?category=dairy-alternatives" className="text-decoration-none text-body">Dairy Alternatives</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>Bakery & Bread</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=fresh-bread" className="text-decoration-none text-body">Fresh Bread</Link></li>
                            <li><Link to="/shop?category=buns-rolls" className="text-decoration-none text-body">Buns & Rolls</Link></li>
                            <li><Link to="/shop?category=breakfast-pastries" className="text-decoration-none text-body">Breakfast Pastries</Link></li>
                            <li><Link to="/shop?category=cakes-cupcakes" className="text-decoration-none text-body">Cakes & Cupcakes</Link></li>
                            <li><Link to="/shop?category=cookies-brownies" className="text-decoration-none text-body">Cookies & Brownies</Link></li>
                            <li><Link to="/shop?category=gluten-free-bakery" className="text-decoration-none text-body">Gluten-Free Bakery</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header>Beverages</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=water" className="text-decoration-none text-body">Water & Sparkling</Link></li>
                            <li><Link to="/shop?category=sodas" className="text-decoration-none text-body">Sodas & Soft Drinks</Link></li>
                            <li><Link to="/shop?category=coffee" className="text-decoration-none text-body">Coffee</Link></li>
                            <li><Link to="/shop?category=tea" className="text-decoration-none text-body">Tea</Link></li>
                            <li><Link to="/shop?category=juices" className="text-decoration-none text-body">Juices & Drinks</Link></li>
                            <li><Link to="/shop?category=energy-drinks" className="text-decoration-none text-body">Energy & Sports Drinks</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header>Frozen Foods</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=frozen-meals" className="text-decoration-none text-body">Frozen Meals</Link></li>
                            <li><Link to="/shop?category=frozen-vegetables" className="text-decoration-none text-body">Frozen Vegetables</Link></li>
                            <li><Link to="/shop?category=frozen-fruits" className="text-decoration-none text-body">Frozen Fruits</Link></li>
                            <li><Link to="/shop?category=ice-cream" className="text-decoration-none text-body">Ice Cream & Desserts</Link></li>
                            <li><Link to="/shop?category=frozen-breakfast" className="text-decoration-none text-body">Frozen Breakfast</Link></li>
                            <li><Link to="/shop?category=frozen-snacks" className="text-decoration-none text-body">Frozen Appetizers & Snacks</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header>Snacks & Candy</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            <li><Link to="/shop?category=chips" className="text-decoration-none text-body">Chips & Pretzels</Link></li>
                            <li><Link to="/shop?category=cookies" className="text-decoration-none text-body">Cookies & Biscuits</Link></li>
                            <li><Link to="/shop?category=chocolate" className="text-decoration-none text-body">Chocolate & Candy</Link></li>
                            <li><Link to="/shop?category=nuts-seeds" className="text-decoration-none text-body">Nuts & Seeds</Link></li>
                            <li><Link to="/shop?category=granola-bars" className="text-decoration-none text-body">Granola & Cereal Bars</Link></li>
                            <li><Link to="/shop?category=snack-mixes" className="text-decoration-none text-body">Popcorn & Snack Mixes</Link></li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default AccordionItems;