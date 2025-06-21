import Row from 'react-bootstrap/Row';
import CarouselItems from "../components/CarouselItems.jsx";
import Featuresbar from '../components/Featuresbar.jsx';
import HotCards from '../components/HotCards.jsx';
import NewArrivals from '../components/NewArrivals.jsx';
import BestSellers from '../components/BestSellers.jsx';
import EspecialOffers from '../components/EspecialOffers.jsx';


function Home() {
    return (
        <Row className='d-flex justify-content-center align-items-center gap-5'>
            <CarouselItems />
            <Featuresbar />
            <EspecialOffers/>
            <HotCards />
            <BestSellers />
            <NewArrivals/>
            
        </Row>
    );
}


export default Home;