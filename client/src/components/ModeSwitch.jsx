import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MaterialUISwitch from "../components/MaterialUISwitch";
import { useTheme } from "../contexts/ThemeContext";

function ModeSwitch() {
    const {mode, handleToggle} = useTheme();
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <MaterialUISwitch
                        sx={{ m: 1 }}
                        checked={!mode}
                        onChange={(e) => handleToggle(e.target.checked)}
                    />
                }
            />
        </FormGroup>
    );
}


export default ModeSwitch;