import React from "react";
import "../styles/Navbar.css";
import FirstBar from "./FirstBar";
import SecondBar from "./SecondBar";

function Navbar() {
    return (
        <div>
            <div className="d-none d-lg-block navbar-container container-fluid px-3" id="navbar">
                <div className="row">
                    <div className="col-12">
                        <FirstBar/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <SecondBar />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;