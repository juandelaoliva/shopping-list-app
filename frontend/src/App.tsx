import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ListPage from './pages/ListPage';
import './index.css';

function App() {
  console.log('App Version: 1.0.1'); // Cache buster
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/list/:id" element={<ListPage />} />
      </Routes>
    </Router>
  );
}

export default App; 