const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

// Admin: Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email role');
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Admin: Add student
router.post('/', auth, async (req, res) => {
  const { name, email, password, course } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'student', isVerified: true });
    await user.save();

    const student = new Student({ user: user._id, course });
    await student.save();

    res.json({ message: 'Student added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Admin: Update student
router.put('/:id', auth, async (req, res) => {
  const { name, email, password, course } = req.body;

  try {
    const student = await Student.findById(req.params.id).populate('user');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Update user details
    if (name) student.user.name = name;
    if (email) student.user.email = email;
    if (password) student.user.password = await bcrypt.hash(password, 10);
    await student.user.save();

    // Update student details
    if (course) student.course = course;
    await student.save();

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Admin: Delete student
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await User.findByIdAndDelete(student.user);
    await student.deleteOne();

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Student: Update own profile
router.put('/me', auth, async (req, res) => {
  const { name, email, password, course } = req.body;

  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (name) student.user.name = name;
    if (email) student.user.email = email;
    if (password) student.user.password = await bcrypt.hash(password, 10);
    await student.user.save();

    if (course) student.course = course;
    await student.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Student: Get own profile
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json({ user: student.user, course: student.course, enrollmentDate: student.enrollmentDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
