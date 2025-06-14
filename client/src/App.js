import './styles/App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import BottomNavbar from './components/BottomNavbar.jsx';
import Account from './pages/Account.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import ContextProvider from "./contexts/ContextProvider";
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';

function App() {
  return (
    <Router>
      <ContextProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="content-wrapper py-4">
            <Container fluid>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Container>
          </main>
          <Footer />
          <div className="d-block d-lg-none">
            <BottomNavbar />
          </div>
        </div>
      </ContextProvider>
    </Router>
  );
}
export default App;
