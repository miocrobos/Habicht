'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Lock, User, Calendar, Globe, Video, Award, Weight, Activity } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';
import VideoUpload from '@/components/shared/VideoUpload';
import StarRating from '@/components/shared/StarRating';
import { NATIONALITIES, POSITIONS } from '@/lib/swissEducation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    dateOfBirth: '', gender: '', nationality: '', positions: [] as string[], height: '',
    weight: '', spikeHeight: '', blockHeight: '', hasClub: false, clubName: '',
    profileImage: '', instagram: '', tiktok: '', youtube: '', highlightVideo: '',
    skillReceiving: 0, skillServing: 0, skillAttacking: 0, skillBlocking: 0, skillDefense: 0,
    swissVolleyLicense: '', phone: '', bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (p: string) => {
    if (p.length < 8) return { valid: false, message: 'Password Must Be At Least 8 Characters' };
    if (!/\d/.test(p)) return { valid: false, message: 'Password Must Contain A Number' };
    if (!/[!@#$%^&*()]/.test(p)) return { valid: false, message: 'Password Must Contain A Special Character' };
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) { setError('Passwords Do Not Match'); return; }
      const check = validatePassword(formData.password);
      if (!check.valid) { setError(check.message); return; }
      setStep(2);
      return;
    }
    if (!formData.gender) { setError('Please Select Your Gender'); return; }
    if (!formData.nationality) { setError('Please Select Your Nationality'); return; }
    if (formData.positions.length === 0) { setError('Please Select At Least One Position'); return; }
    if (!formData.profileImage) { setError('Please Upload Profile Image'); return; }
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        name: fullName,
        role: 'PLAYER',
        playerData: {
          firstName: formData.firstName, lastName: formData.lastName, dateOfBirth: formData.dateOfBirth,
          gender: formData.gender, nationality: formData.nationality, positions: formData.positions,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          spikeHeight: formData.spikeHeight ? parseFloat(formData.spikeHeight) : undefined,
          blockHeight: formData.blockHeight ? parseFloat(formData.blockHeight) : undefined,
          hasClub: formData.hasClub, clubName: formData.clubName,
          profileImage: formData.profileImage,
          instagram: formData.instagram, tiktok: formData.tiktok, youtube: formData.youtube,
          highlightVideo: formData.highlightVideo, swissVolleyLicense: formData.swissVolleyLicense,
          skillReceiving: formData.skillReceiving, skillServing: formData.skillServing,
          skillAttacking: formData.skillAttacking, skillBlocking: formData.skillBlocking,
          skillDefense: formData.skillDefense, phone: formData.phone, bio: formData.bio
        }
      });
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An Error Occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePositionToggle = (position: string) => {
    const newPositions = formData.positions.includes(position)
      ? formData.positions.filter(p => p !== position)
      : [...formData.positions, position];
    setFormData({ ...formData, positions: newPositions });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Registration</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Join The Swiss Volleyball Community</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />Email
                  </label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock className="w-4 h-4 inline mr-1" />Password (8+ Chars, Number, Symbol)
                  </label>
                  <input name="password" type="password" required value={formData.password} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
                  {loading ? 'Creating...' : 'Continue →'}
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Player Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input name="lastName" required value={formData.lastName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
                <ImageUpload label="Profile Image *" value={formData.profileImage}
                  onChange={(v) => setFormData({ ...formData, profileImage: v })} aspectRatio="square" required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="w-4 h-4 inline mr-1" />Gender *
                    </label>
                    <select name="gender" required value={formData.gender} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Globe className="w-4 h-4 inline mr-1" />Nationality *
                    </label>
                    <select name="nationality" required value={formData.nationality} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">Select...</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position(s) * <span className="text-xs text-gray-500">(Select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {POSITIONS.map(pos => (
                      <label key={pos} className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.positions.includes(pos)}
                          onChange={() => handlePositionToggle(pos)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                    <input name="height" type="number" value={formData.height} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="180" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Weight className="w-4 h-4 inline mr-1" />Weight (kg)
                    </label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="75" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />Date Of Birth
                    </label>
                    <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />Spike Height (cm)
                    </label>
                    <input name="spikeHeight" type="number" value={formData.spikeHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="320" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />Block Height (cm)
                    </label>
                    <input name="blockHeight" type="number" value={formData.blockHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="300" />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Club Information</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hasClub}
                        onChange={(e) => setFormData({ ...formData, hasClub: e.target.checked, clubName: '' })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        I Am Currently Playing For A Club
                      </span>
                    </label>
                    {formData.hasClub && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Club Name *
                        </label>
                        <input
                          name="clubName"
                          value={formData.clubName}
                          onChange={handleChange}
                          required={formData.hasClub}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your club name"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          If your club is not in our database, it will be added for review.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Social Media</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                      <input name="instagram" value={formData.instagram} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok</label>
                      <input name="tiktok" value={formData.tiktok} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                      <input name="youtube" value={formData.youtube} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Channel" />
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />Highlight Video
                  </h4>
                  <VideoUpload value={formData.highlightVideo}
                    onChange={(v) => setFormData({ ...formData, highlightVideo: v })} label="Upload Your Best Game Highlight" />
                </div>
                <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Skills Self-Assessment</h4>
                  <div className="space-y-3">
                    <StarRating label="Receiving" value={formData.skillReceiving} onChange={(v) => setFormData({ ...formData, skillReceiving: v })} />
                    <StarRating label="Serving" value={formData.skillServing} onChange={(v) => setFormData({ ...formData, skillServing: v })} />
                    <StarRating label="Attacking" value={formData.skillAttacking} onChange={(v) => setFormData({ ...formData, skillAttacking: v })} />
                    <StarRating label="Blocking" value={formData.skillBlocking} onChange={(v) => setFormData({ ...formData, skillBlocking: v })} />
                    <StarRating label="Defense" value={formData.skillDefense} onChange={(v) => setFormData({ ...formData, skillDefense: v })} />
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />Swiss Volley License (Optional)
                  </h4>
                  <ImageUpload label="Upload License Photo" value={formData.swissVolleyLicense}
                    onChange={(v) => setFormData({ ...formData, swissVolleyLicense: v })} aspectRatio="banner" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                    {loading ? 'Creating Profile...' : 'Create Profile ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already Have An Account? <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
}
