import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  cr: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  allowedRadius: { type: Number, required: true, default: 30 },
  schedule: {
    dayOfWeek: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
      required: true 
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);