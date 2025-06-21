import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
    const { i18n, t } = useTranslation();
    const [, setLang] = useState(i18n.language);
    
    useEffect(() => {
        const handleLanguageChanged = () => {
            setLang(i18n.language);
        };
        
        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);
    
    return { t, i18n };
}
