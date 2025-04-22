import React from "react";
import "../styles/AnnouncementBar.css"

function AnnouncementBar() {
    return (
        <div className="announcementbar">
            <p>FREE delivery & 40% Discount for next 3 orders! Place your 1st order in.</p>
            <p>Until the end of the sale: <span>47</span> days <span>06</span> hours <span>55</span> minutes <span>51</span> sec</p>
        </div>
    );
}

export default AnnouncementBar;