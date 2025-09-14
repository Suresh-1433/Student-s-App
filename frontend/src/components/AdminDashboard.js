import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', course: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const BASE_URL = 'https://student-s-app.onrender.com';

  const fetchStudents = async () => {
    if (!token) return navigate('/login');
    try {
      const res = await axios.get(`${BASE_URL}/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!token) return navigate('/login');
    try {
      if (editId) {
        await axios.put(`${BASE_URL}/api/students/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${BASE_URL}/api/students`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: '', email: '', course: '' });
      setEditId(null);
      fetchStudents();
    } catch (err) {
      setError('Failed to save student');
    }
  };

  const onEdit = student => {
    setEditId(student._id);
    setForm({
      name: student.user?.name || '',
      email: student.user?.email || '',
      course: student.course || '',
    });
  };

  const onDelete = async id => {
    if (!token) return navigate('/login');
    try {
      await axios.delete(`${BASE_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={onSubmit} style={{ marginBottom: '30px' }}>
        <input type="text" name="name" placeholder="Student Name" value={form.name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Student Email" value={form.email} onChange={onChange} required />
        <input type="text" name="course" placeholder="Course" value={form.course} onChange={onChange} />
        <button type="submit">{editId ? 'Update Student' : 'Add Student'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Course</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr><td colSpan="4">No students found</td></tr>
          ) : students.map(student => (
            <tr key={student._id}>
              <td>{student.user?.name || 'N/A'}</td>
              <td>{student.user?.email || 'N/A'}</td>
              <td>{student.course || 'N/A'}</td>
              <td>
                <button onClick={() => onEdit(student)}>Edit</button>
                <button onClick={() => onDelete(student._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={logout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
};

export default AdminDashboard;