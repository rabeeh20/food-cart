import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MenuManagement from './pages/MenuManagement';
import FishManagement from './pages/FishManagement';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router basename="/admin">
      <SocketProvider>
        <div className="App">
          {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
          <div className="container">
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Login setIsAuthenticated={setIsAuthenticated} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/orders"
                element={
                  isAuthenticated ? <Orders /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/menu"
                element={
                  isAuthenticated ? <MenuManagement /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/fish"
                element={
                  isAuthenticated ? <FishManagement /> : <Navigate to="/login" />
                }
              />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/orders" : "/login"} />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;
