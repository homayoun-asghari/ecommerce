import React, { useState, useCallback } from 'react';
import {
    Form,
    Accordion,
    Button,
    Stack,
    InputGroup,
    Row,
    Col
} from 'react-bootstrap';
import { useSideBar } from "../contexts/SideBarContext";
import "../styles/Categories.css";
import CategoryItems from "./CategoryItems";

const FilterSideBar = ({
    categories = [],
    onFilterChange,
    filters,
    className = ''
}) => {
    const [priceRange, setPriceRange] = useState({
        min: 0,
        max: 1000
    });
    const { setIsOpen } = useSideBar();

    const handlePriceChange = useCallback((e) => {
        const { name, value } = e.target;
        const newValue = Math.max(0, Math.min(1000, parseInt(value, 10) || 0));
        const newRange = {
            ...priceRange,
            [name]: newValue
        };

        // Ensure min is not greater than max and vice versa
        if (name === 'min' && newValue > priceRange.max) {
            newRange.max = newValue;
        } else if (name === 'max' && newValue < priceRange.min) {
            newRange.min = newValue;
        }

        setPriceRange(newRange);
        onFilterChange({ priceRange: newRange });
    }, [priceRange, onFilterChange]);

    const handleCategoryChange = useCallback((category, checked) => {
        const newCategories = checked
            ? [...new Set([...filters.categories, category])]
            : filters.categories.filter(c => c !== category);

        onFilterChange({ categories: newCategories });
    }, [filters.categories, onFilterChange]);

    const handleRatingChange = useCallback((rating) => {
        onFilterChange({
            minRating: filters.minRating === rating ? 0 : rating
        });
    }, [filters.minRating, onFilterChange]);

    const handleClearRating = useCallback(() => {
        onFilterChange({ minRating: 0 });
    }, [onFilterChange]);

    function handleClick() {
        setIsOpen(prev => !prev);
    }

    return (
        <div className="set category-wrapper">
            <div className="accordion-trigger">
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header
                            onClick={handleClick}
                            id="all"
                        >
                            Filters
                        </Accordion.Header>
                        <Accordion.Body className="accordion-dropdown" >
                            <Accordion>
                                {/* Price Range Filter */}
                                <Accordion.Item eventKey="0" className="mb-3">
                                    <Accordion.Header>Price Range</Accordion.Header>
                                    <Accordion.Body>
                                        <Stack gap={3}>
                                            <Row className="g-2">
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label className="small text-muted mb-1">Min</Form.Label>
                                                        <InputGroup size="sm">
                                                            <InputGroup.Text>$</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                max={priceRange.max}
                                                                value={priceRange.min}
                                                                onChange={(e) => handlePriceChange({
                                                                    target: { name: 'min', value: e.target.value }
                                                                })}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label className="small text-muted mb-1">Max</Form.Label>
                                                        <InputGroup size="sm">
                                                            <InputGroup.Text>$</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                min={priceRange.min}
                                                                max="1000"
                                                                value={priceRange.max}
                                                                onChange={(e) => handlePriceChange({
                                                                    target: { name: 'max', value: e.target.value }
                                                                })}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Range
                                                min="0"
                                                max="1000"
                                                value={priceRange.max}
                                                name="max"
                                                onChange={handlePriceChange}
                                                className="mt-2"
                                            />
                                        </Stack>
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Categories Filter */}
                                <Accordion.Item eventKey="1" className="mb-3">
                                    <Accordion.Header>Categories</Accordion.Header>
                                    <Accordion.Body>
                                        <CategoryItems />
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Rating Filter */}
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Rating</Accordion.Header>
                                    <Accordion.Body>
                                        <Stack gap={2}>
                                            {[4, 3, 2, 1].map((rating) => (
                                                <Form.Check
                                                    key={rating}
                                                    type="radio"
                                                    name="rating"
                                                    id={`rating-${rating}`}
                                                    label={`${rating} Stars & Up`}
                                                    checked={filters.minRating === rating}
                                                    onChange={() => handleRatingChange(rating)}
                                                    className="px-2 py-1 rounded hover-bg-light"
                                                />
                                            ))}
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="mt-2"
                                                onClick={handleClearRating}
                                                disabled={!filters.minRating}
                                            >
                                                Clear Rating
                                            </Button>
                                        </Stack>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

export default React.memo(FilterSideBar);
