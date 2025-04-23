import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MaterialUISwitch from "../components/MaterialUISwitch";

function ModeSwitch(props) {
    return (
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
    );
}


export default ModeSwitch;