import Row from 'react-bootstrap/Row';
import CarouselItems from "../components/CarouselItems.jsx";
import Featuresbar from '../components/Featuresbar.jsx';
import HotCards from '../components/HotCards.jsx';
import Products from '../components/Products.jsx';


function Home() {
    return (
        <Row className='d-flex justify-content-center align-items-center gap-5'>
            <CarouselItems />
            <Featuresbar />
            <HotCards />
            <Products title = "New Arrivals" content = "Dont miss this opportunity at a special discount just for this week."/>
            <HotCards />
            <Products title = "Best Sellers" content = "Some of the new products arriving this weeks"/>
        </Row>
    );
}


export default Home;