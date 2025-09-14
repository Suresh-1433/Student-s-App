import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', course: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = 'https://student-s-app.onrender.com';

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/signup`, formData);
      localStorage.setItem('token', res.data.token);

      // Decode token to get role
      const base64Url = res.data.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const { user } = JSON.parse(jsonPayload);
      localStorage.setItem('role', user.role);

      if (user.role === 'admin') navigate('/admin');
      else navigate('/student');

    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" onChange={onChange} required />
        <input type="text" name="course" placeholder="Course" onChange={onChange} required />
        <select name="role" onChange={onChange} value={formData.role}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;