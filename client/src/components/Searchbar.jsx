import React from "react";
import { Form, InputGroup, Button} from 'react-bootstrap';
import "../styles/Searchbar.css"

function Searchbar(props) {
    const handleSearch = () => {
        console.log('Search triggered');
    };
    return (
        <Form className="search-bar" onSubmit={e => e.preventDefault()} style={{width : props.width}}>
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder={props.placeholder}
                    className="search-input"
                />
                <Button
                    id="search-button"
                    onClick={handleSearch}
                    type="submit"
                >
                    {props.button}
                </Button>
            </InputGroup>
        </Form>
    );
}


export default Searchbar;