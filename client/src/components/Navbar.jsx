import React from "react";
import "../styles/Navbar.css";
import AnnouncementBar from "./AnnouncementBar";
import FirstBar from "./FirstBar";
import SecondBar from "./SecondBar";
import ThirdBar from "./ThirdBar";


function Navbar(props) {

    return (
        <div>
            <AnnouncementBar />
            <div id="navbar">
                <FirstBar />
                <SecondBar mode = {props.mode} onSubmit = {props.onSubmit}/>
                <ThirdBar />
            </div>
        </div>
    );
}

export default Navbar;