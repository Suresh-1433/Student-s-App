import express from 'express';
import { auth } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
