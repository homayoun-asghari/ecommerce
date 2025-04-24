import React from "react";
import Row from 'react-bootstrap/Row';
import LogoCard from '../components/LogoCard.jsx';
import mid1 from "../assets/midIcon1.png";
import mid2 from "../assets/midIcon2.png";
import mid3 from "../assets/midIcon3.png";
import mid4 from "../assets/midIcon4.png";

function Featuresbar() {
    return (
        <Row className='border-bottom'>
            <LogoCard img={mid1} title="Payment only online" content="Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa." />

            <LogoCard img={mid2} title="New stocks and sales" content="Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa." />

            <LogoCard img={mid3} title="Quality assurance" content="Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa." />

            <LogoCard img={mid4} title="Delivery from 1 hour" content="Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa." />
        </Row>
    );
}

export default Featuresbar;