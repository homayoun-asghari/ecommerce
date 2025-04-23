import React from "react";
import { Form, InputGroup, Button} from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import "../styles/Searchbar.css"

function Searchbar() {
    const handleSearch = () => {
        console.log('Search triggered');
    };
    return (
        <Form className="search-bar" onSubmit={e => e.preventDefault()}>
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                />
                <Button
                    id="search-button"
                    onClick={handleSearch}
                    type="submit"
                >
                    <Search />
                </Button>
            </InputGroup>
        </Form>
    );
}


export default Searchbar;