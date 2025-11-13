import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">í½Ž Nutri AI</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <span className="welcome-text">Welcome, {user.username}!</span>
            <Link to="/" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
