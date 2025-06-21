import React from "react";
import { useTranslation } from 'react-i18next';
import Row from 'react-bootstrap/Row';
import LogoCard from './LogoCard';
import mid1 from "../assets/midIcon1.png";
import mid2 from "../assets/midIcon2.png";
import mid3 from "../assets/midIcon3.png";
import mid4 from "../assets/midIcon4.png";

function Featuresbar() {
    const { t } = useTranslation('features');
    const features = t('features', { returnObjects: true, defaultValue: [] });
    
    // Default features in case translations aren't loaded
    const defaultFeatures = [
        { id: 'onlinePayment', title: 'Payment only online', description: 'Secure online payments with multiple payment options.' },
        { id: 'newStocks', title: 'New stocks and sales', description: 'Regularly updated inventory with special offers.' },
        { id: 'qualityAssurance', title: 'Quality assurance', description: 'All products undergo strict quality checks.' },
        { id: 'fastDelivery', title: 'Fast delivery', description: 'Quick and reliable shipping options available.' }
    ];
    
    const featureIcons = [mid1, mid2, mid3, mid4];
    const displayFeatures = features.length > 0 ? features : defaultFeatures;

    return (
        <Row className='border-bottom'>
            {displayFeatures.map((feature, index) => (
                <LogoCard 
                    key={feature.id}
                    img={featureIcons[index % featureIcons.length]}
                    title={feature.title}
                    content={feature.description}
                />
            ))}
        </Row>
    );
}

export default Featuresbar;