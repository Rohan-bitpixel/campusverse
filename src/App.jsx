import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CampusMapPage from './pages/CampusMapPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';

const CollabPlaceholder = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
    <h2>Collab Board Coming Soon</h2>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collab" element={<CollabPlaceholder />} />
          <Route path="/map" element={<CampusMapPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}