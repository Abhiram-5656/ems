import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, enum: ['ADMIN', 'HR', 'EMPLOYEE', 'MANAGER'] },
    permissions: [String],
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);