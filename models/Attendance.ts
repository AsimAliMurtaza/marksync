import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class", 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  location: { 
    latitude: Number, 
    longitude: Number 
  },
  status: { 
    type: String, 
    enum: ["present", "absent"], 
    required: true 
  },
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);