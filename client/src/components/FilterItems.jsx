import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from 'react-bootstrap/Accordion';
import {
    Form,
    Stack,
    InputGroup,
    Row,
    Col
} from 'react-bootstrap';
import CategoryItems from "./CategoryItems";
import { useFilters } from '../contexts/FilterContext';

function AccordionItems() {
    const { t } = useTranslation();
    const { filters, updateFilters } = useFilters();
    const [priceRange, setPriceRange] = useState({
        min: filters.priceRange?.min || 0,
        max: filters.priceRange?.max || 1000
    });
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
        updateFilters({
            ...filters,
            priceRange: newRange
        });
    }, [priceRange, filters, updateFilters]);

    const handleRatingChange = useCallback((rating) => {
        updateFilters({
            ...filters,
            minRating: filters.minRating === rating ? 0 : rating
        });
    }, [filters, updateFilters]);

    return (
        <div>
            <Accordion>
                {/* Price Range Filter */}
                <Accordion.Item eventKey="0" className="mb-3">
                    <Accordion.Header>{t('filters:priceRange.title')}</Accordion.Header>
                    <Accordion.Body>
                        <Stack gap={3}>
                            <Row className="g-2">
                                <Col>
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">{t('filters:priceRange.min')}</Form.Label>
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
                                        <Form.Label className="small text-muted mb-1">{t('filters:priceRange.max')}</Form.Label>
                                        <InputGroup size="sm">
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                min={priceRange.min}
                                                max="1000"
                                                value={priceRange.max}
                                                onChange={handlePriceChange}
                                                name="max"
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
                    <Accordion.Header>{t('filters:categories.title')}</Accordion.Header>
                    <Accordion.Body>
                        <CategoryItems />
                    </Accordion.Body>
                </Accordion.Item>

                {/* Rating Filter */}
                <Accordion.Item eventKey="2">
                    <Accordion.Header>{t('filters:rating.title')}</Accordion.Header>
                    <Accordion.Body>
                        <Stack gap={2}>
                            {[4, 3, 2, 1].map((rating) => (
                                <Form.Check
                                    key={rating}
                                    type="radio"
                                    name="rating"
                                    id={`rating-${rating}`}
                                    label={t('filters:rating.starsAndUp', { rating })}
                                    checked={filters.minRating === rating}
                                    onChange={() => handleRatingChange(rating)}
                                    className="px-2 py-1 rounded hover-bg-light"
                                />
                            ))}
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}


export default AccordionItems;