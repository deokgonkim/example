import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./App.css";

// Import your components here
import { Home } from "./Home.jsx";
import { About } from "./About.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/about"
        element={
          <About />
        } />
        <Route path="/"
        element={
          <Home />
        } />
      </Routes>
    </Router>
  );
}

export default App;
