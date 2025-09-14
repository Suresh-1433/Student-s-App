import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', course: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const BASE_URL = 'https://student-s-app.onrender.com';

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data.user);
      setForm({
        name: res.data.user.name,
        email: res.data.user.email,
        course: res.data.user.course || '',
      });
    } catch (err) {
      setError('Failed to fetch profile');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setSuccess(''); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/students/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
      fetchProfile();
    } catch {
      setError('Failed to update profile');
    }
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; };

  if (!student) return <div className="student-dashboard"><h2>Student Dashboard</h2><p>Loading profile...</p></div>;

  return (
    <div className="student-dashboard">
      <h2>Student Dashboard</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      {success && <p style={{color:'green'}}>{success}</p>}
      <form onSubmit={onSubmit}>
        <input type="text" name="name" value={form.name} onChange={onChange} />
        <input type="email" name="email" value={form.email} onChange={onChange} />
        <input type="text" name="course" value={form.course} onChange={onChange} />
        <button type="submit">Update Profile</button>
      </form>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default StudentDashboard;