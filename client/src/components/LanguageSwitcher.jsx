import React, { useEffect } from 'react';
import { MenuItem, Select } from '@mui/material';
import i18next from 'i18next';

function LanguageSwitcher() {
    const currentLang = i18next.language;

    const handleChange = (lang) => {
        i18next.changeLanguage(lang);
        localStorage.setItem("lang", lang); // optional
    };

    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang && savedLang !== currentLang) {
            i18next.changeLanguage(savedLang);
        }
    }, []);


    return (
        <Select
            value={currentLang}
            onChange={(e) => handleChange(e.target.value)}
            size="small"
            variant="outlined"
            sx={{
                minWidth: 80,
                color: "#6C7180",
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: "#6C7180",
                },
                '& .MuiSelect-icon': {
                    color: "#6C7180",
                },
            }}

        >

            <MenuItem value="en">🇺🇸 English</MenuItem>
            <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
            <MenuItem value="fa">🇮🇷 فارسی</MenuItem>
        </Select>
    );
}

export default LanguageSwitcher;
