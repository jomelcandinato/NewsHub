import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ReadingHistory from './components/ReadingHistory';
import Favorites from './components/Favorites';
import SearchHistory from './components/SearchHistory';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar onSearch={handleSearch} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<NewsList searchQuery={searchQuery} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reading-history" element={<ReadingHistory />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/favorites/:favoriteId" element={<NewsDetail />} />
              <Route path="/search-history" element={<SearchHistory />} />
              <Route path="/news/history/:id" element={<NewsDetail />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/about" element={
                <div className="about-page">
                  <h2>About NewsHub</h2>
                  <p><strong>NewsHub</strong> is an academic project developed by Group 3 for the subject Integrative Programming & Technologies. NewsHub serves as a comprehensive news aggregation platform that provides users with real-time access to both worldwide and local news articles. Built with <i>ReactJS</i> and powered by the <i>NewsData.io</i> API, the website features an intuitive user interface with robust filtering capabilities, allowing users to browse news by various categories and toggle between local and international news sources. The platform includes advanced search functionality for keyword-based news discovery, detailed article views with related content suggestions, and responsive design that works across desktop and mobile devices. NewsHub demonstrates modern web development practices, API integration, and user-centric design while serving as an educational tool for understanding full-stack development concepts.</p>
                  <h3>GROUP MEMBERS</h3>
                  <h6> CANDINATO, JOMEL </h6>
                  <h6> MEDALLA, LAWRENCE </h6>
                  <h6> NOVERO, JEREMY </h6>
                  <h6> VALENCIA, PAUL DEXTER </h6>
                </div>
              } />
            </Routes>
          </main>
          <footer className="footer">
            <p>© NewsHub │ Final Project in Integrative Programming & Technologies</p>
            <p></p>
            <p>Data provided by NewsData.io API</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;