import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">🏃 UniSports</div>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        <Link to="/chat" className="navbar-link">Chat Rooms</Link>
        <Link to={`/profile/${user.id}`} className="navbar-link">My Profile</Link>
        <span className="navbar-link">{user.username}</span>
        <button onClick={onLogout} className="button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
