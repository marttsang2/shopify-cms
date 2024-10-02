import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CompanyList from './pages/Companies';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer/:id" element={<CustomerDetail />} />
        <Route path="/company" element={<CompanyList />} />
      </Routes>
    </Router>
  );
}

export default App;
