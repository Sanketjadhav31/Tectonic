import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lookbook from './pages/Lookbook';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lookbook />} />
          <Route path="/lookbook" element={<Lookbook />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
