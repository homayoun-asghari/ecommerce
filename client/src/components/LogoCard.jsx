import React from "react";
import Col from 'react-bootstrap/Col';

function LogoCard(props) {
    return (
        <Col>
            <div style={{display:"flex", alignItems: "center", gap: "var(--space-xs)"}}>
            <img src={props.img} alt="logo" style={{maxHeight:"40px"}}/>
            <div>
                <h5>{props.title}</h5>
                <p style={{fontSize: "smaller"}}>{props.content}</p>
            </div>
        </div>
        </Col>
    );
}

export default LogoCard;