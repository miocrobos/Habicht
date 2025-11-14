import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '16px' }}>Welcome back, {user.fullName}! 👋</h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
          Connect with fellow athletes from Swiss universities
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
              <h3>💬 Join Chat Rooms</h3>
              <p>Connect with students from your university</p>
            </div>
          </Link>
          <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
              <h3>👤 My Profile</h3>
              <p>View and edit your sports profile</p>
            </div>
          </Link>
          <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <h3>🏆 Achievements</h3>
            <p>Track your sports achievements</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>About UniSports</h2>
        <p style={{ lineHeight: '1.6', color: '#666' }}>
          UniSports is a platform designed to bring together students from all Swiss universities 
          and Hochschulen who are passionate about sports. Whether you're a beginner or a seasoned 
          athlete, connect with like-minded individuals, share your achievements, and participate 
          in university sports communities.
        </p>
        <div style={{ marginTop: '24px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px' }}>Key Features:</h3>
          <ul style={{ paddingLeft: '24px', lineHeight: '2' }}>
            <li>🏫 University-specific chat rooms</li>
            <li>👥 Connect with athletes across Switzerland</li>
            <li>🏆 Showcase your sports achievements</li>
            <li>⭐ Build your reputation with ratings</li>
            <li>🎯 Track your sports participation levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
