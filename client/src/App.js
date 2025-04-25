import './styles/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";
import Shop from './pages/Shop.jsx';
import BottomNavbar from './components/BottomNavbar.jsx';
import MyContext from "./components/MyContext";

function App() {
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return storedMode === 'dark' ? false : true;
  });

  function handleClick() {
    setMode(prev => {
      const newMode = !prev;
      localStorage.setItem('themeMode', newMode ? 'light' : 'dark');
      return newMode;
    });
  }

  useEffect(() => {
    const body = document.body;

    // Disable transitions
    body.classList.add("theme-transition");

    // Change theme
    body.setAttribute("data-bs-theme", mode ? "light" : "dark");

    // Re-enable transitions after a tick
    const timeout = setTimeout(() => {
      body.classList.remove("theme-transition");
    }, 0);

    return () => clearTimeout(timeout);
  }, [mode]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <MyContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="app-wrapper">
        <Router>
          <Navbar onSubmit={handleClick} mode={mode} />
          <main className="content-wrapper py-4">
            <Container fluid>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
              </Routes>
            </Container>
          </main>
          <Footer mode={mode} />
          <div style={{ height: "55px", backgroundColor: mode ? "var(--color-secondary)" : "black", }}></div>
          <div className="d-block d-lg-none">
            <BottomNavbar mode={mode} onSubmit={handleClick} />
          </div>
        </Router >
      </div>
    </MyContext.Provider>
  );
}

export default App;
