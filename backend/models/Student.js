import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
