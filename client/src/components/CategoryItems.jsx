import React, { useCallback } from "react";
import Accordion from 'react-bootstrap/Accordion';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import { useLanguage } from '../hooks/useLanguage';

function AccordionItems() {
    const { filters, updateFilters } = useFilters();
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    // Get all section translations
    const sections = t('categories:sections', { returnObjects: true });
    
    // Get all category translations
    const categoryTranslations = (section) => {
        return t(`categories:${section}`, { returnObjects: true });
    };

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

    const renderCategoryLink = (to, categoryKey, section) => {
        const category = categoryTranslations(section)[categoryKey];
        return (
            <li key={categoryKey}>
                <a 
                    href={to} 
                    className={`text-decoration-none ${isCategoryActive(categoryKey) ? 'fw-bold' : 'text-body'}`}
                    onClick={(e) => handleCategoryClick(e, categoryKey)}
                >
                    {category}
                </a>
            </li>
        );
    };

    return (
        <div>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{sections.fruitsVegetables}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('fruitsVegetables')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'fruitsVegetables')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>{sections.meatsSeafood}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('meatsSeafood')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'meatsSeafood')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>{sections.dairyEggs}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('dairyEggs')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'dairyEggs')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>{sections.bakeryBread}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('bakeryBread')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'bakeryBread')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header>{sections.beverages}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('beverages')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'beverages')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header>{sections.frozenFoods}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('frozenFoods')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'frozenFoods')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header>{sections.snacksCandy}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-unstyled">
                            {Object.entries(categoryTranslations('snacksCandy')).map(([key]) => (
                                renderCategoryLink(`/shop?category=${key}`, key, 'snacksCandy')
                            ))}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default AccordionItems;