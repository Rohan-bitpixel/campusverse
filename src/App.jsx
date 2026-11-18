import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CampusMapPage from './pages/CampusMapPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import StudentIdPage from './pages/StudentIDPage.jsx';
import CollabPage from './pages/CollabPage.jsx';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<CampusMapPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/student-id" element={<StudentIdPage />} />
          <Route path="/id/:token" element={<StudentIdPage />} />
          <Route path="/collab" element={<CollabPage />} />
        </Routes>
      </div>
    </Router>
  );
} 