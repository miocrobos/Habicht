import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, universityAPI } from '../services/api';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    university: ''
  });
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universityAPI.getAll();
        setUniversities(response.data);
      } catch (err) {
        console.error('Failed to fetch universities:', err);
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '80px auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#667eea' }}>
          🏃 Join UniSports
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              className="input"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@university.ch"
            />
          </div>
          <div className="form-group">
            <label>University</label>
            <select
              name="university"
              className="input"
              value={formData.university}
              onChange={handleChange}
              required
            >
              <option value="">Select your university</option>
              {universities.map(uni => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} - {uni.location}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Choose a strong password"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
