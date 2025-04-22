import './styles/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";

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
    document.body.setAttribute("data-bs-theme", mode ? "light" : "dark");
  }, [mode]);

  return (
    <div className="app-wrapper">
      <Router>
        <Navbar onSubmit={handleClick} mode={mode} />
        <main className="content-wrapper py-4">
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
