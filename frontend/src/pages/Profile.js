import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileAPI } from '../services/api';

function Profile({ user }) {
  const { userId } = useParams();
  const isOwnProfile = !userId || userId === user.id;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    sports: [],
    achievements: []
  });
  const [newSport, setNewSport] = useState('');
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', date: '' });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetId = userId || user.id;
        const response = await profileAPI.getProfile(targetId);
        setProfile(response.data);
        setFormData({
          bio: response.data.profile.bio || '',
          sports: response.data.profile.sports || [],
          achievements: response.data.profile.achievements || []
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, [userId, user.id]);

  const handleSave = async () => {
    try {
      await profileAPI.updateProfile(formData);
      setProfile({ ...profile, profile: { ...profile.profile, ...formData } });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAddSport = () => {
    if (newSport.trim()) {
      setFormData({
        ...formData,
        sports: [...formData.sports, { name: newSport, level: 'Beginner' }]
      });
      setNewSport('');
    }
  };

  const handleRemoveSport = (index) => {
    setFormData({
      ...formData,
      sports: formData.sports.filter((_, i) => i !== index)
    });
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, { ...newAchievement, id: Date.now() }]
      });
      setNewAchievement({ title: '', description: '', date: '' });
    }
  };

  const handleRemoveAchievement = (id) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter(a => a.id !== id)
    });
  };

  const handleRating = async (value) => {
    if (!isOwnProfile) {
      try {
        await profileAPI.rateUser(profile.id, value);
        setRating(value);
        // Refresh profile to get updated rating
        const response = await profileAPI.getProfile(profile.id);
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to rate user:', err);
      }
    }
  };

  if (!profile) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 0 }}>
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <h1>{profile.fullName}</h1>
          <p style={{ opacity: 0.9, marginTop: '8px' }}>@{profile.username}</p>
          <p style={{ opacity: 0.8 }}>{profile.university}</p>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || Math.round(profile.profile.rating)) ? '' : 'empty'}`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => !isOwnProfile && setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ cursor: isOwnProfile ? 'default' : 'pointer' }}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{ marginLeft: '8px' }}>
              ({profile.profile.rating.toFixed(1)} from {profile.profile.ratingCount} ratings)
            </span>
          </div>
          {!isOwnProfile && rating > 0 && (
            <p style={{ marginTop: '8px', opacity: 0.9 }}>You rated: {rating} ★</p>
          )}
        </div>

        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Bio</h2>
            {isOwnProfile && (
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="button"
              >
                {editing ? 'Save' : 'Edit Profile'}
              </button>
            )}
          </div>
          {editing ? (
            <textarea
              className="input"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows="4"
              style={{ minHeight: '100px' }}
            />
          ) : (
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {profile.profile.bio || 'No bio yet...'}
            </p>
          )}
        </div>

        <div className="profile-section">
          <h2 style={{ marginBottom: '16px' }}>Sports & Levels</h2>
          <div>
            {formData.sports.map((sport, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span className="sport-badge">
                  {sport.name} - Level: {sport.level}
                </span>
                {editing && (
                  <>
                    <select
                      value={sport.level}
                      onChange={(e) => {
                        const newSports = [...formData.sports];
                        newSports[index].level = e.target.value;
                        setFormData({ ...formData, sports: newSports });
                      }}
                      className="input"
                      style={{ width: '150px' }}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Professional</option>
                    </select>
                    <button
                      onClick={() => handleRemoveSport(index)}
                      className="button button-secondary"
                      style={{ padding: '8px 12px' }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
            {editing && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <input
                  type="text"
                  className="input"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  placeholder="Add a sport (e.g., Football, Tennis)"
                />
                <button onClick={handleAddSport} className="button">Add Sport</button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2 style={{ marginBottom: '16px' }}>Achievements 🏆</h2>
          <div className="achievement-list">
            {formData.achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ marginBottom: '8px' }}>{achievement.title}</h3>
                    <p style={{ color: '#666', marginBottom: '4px' }}>{achievement.description}</p>
                    <p style={{ fontSize: '14px', color: '#999' }}>{achievement.date}</p>
                  </div>
                  {editing && (
                    <button
                      onClick={() => handleRemoveAchievement(achievement.id)}
                      className="button button-secondary"
                      style={{ padding: '8px 12px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            {editing && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '12px' }}>Add Achievement</h3>
                <div className="form-group">
                  <input
                    type="text"
                    className="input"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    placeholder="Achievement title"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="input"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    placeholder="Description"
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    className="input"
                    value={newAchievement.date}
                    onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                  />
                </div>
                <button onClick={handleAddAchievement} className="button">Add Achievement</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
