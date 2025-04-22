import React from "react";
import Nav from 'react-bootstrap/Nav';
import logo from "../assets/logo.png";
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MaterialUISwitch from '../components/MaterialUISwitch';
import "../styles/SecondBar.css";

function SecondBar(props) {
    const handleSearch = () => {
        // replace this with your actual search logic
        console.log('Search triggered');
    };
    return (
        <div className="bar" style={{ padding: "var(--space-xs) 0", border: "0" }}>
            <div className="set">
                <img src={logo} alt="logo"></img>
                <span>{<PlaceOutlinedIcon />} deliver to</span>
            </div>
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
            <div className="set" >
                <Nav as="ul">
                    <Nav.Item as="li">
                        <Nav.Link href="/signin"> {<PermIdentityOutlinedIcon />} Sign In</Nav.Link>
                    </Nav.Item>
                </Nav>
                <FavoriteBorderOutlinedIcon />
                <ShoppingCartOutlinedIcon />
                <FormGroup>
                    <FormControlLabel
                        control={
                            <MaterialUISwitch
                                sx={{ m: 1 }}
                                checked={!props.mode}
                                onChange={(e) => props.onSubmit(e.target.checked)}
                            />
                        }
                    />
                </FormGroup>

            </div>
        </div>
    );
}

export default SecondBar;