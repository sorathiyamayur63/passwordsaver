import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const groupSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, default: () => uuidv4() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 50 },
  icon: { type: String, default: 'users' },
  color: { type: String, default: '#6366f1' },
  isDefault: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  memberCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

groupSchema.index({ userId: 1, name: 1 }, { unique: true });
groupSchema.index({ userId: 1, order: 1 });

groupSchema.statics.getDefaultsForUser = function(userId) {
  const defaults = [
    { name: 'Family', icon: 'home', color: '#ec4899' },
    { name: 'HR', icon: 'user-check', color: '#8b5cf6' },
    { name: 'Finance', icon: 'landmark', color: '#10b981' },
    { name: 'Marketing', icon: 'megaphone', color: '#f97316' },
    { name: 'Sales', icon: 'trending-up', color: '#3b82f6' },
    { name: 'IT', icon: 'terminal', color: '#06b6d4' },
  ];
  return defaults.map((g, i) => ({
    uuid: uuidv4(),
    userId,
    name: g.name,
    icon: g.icon,
    color: g.color,
    isDefault: true,
    order: i,
    memberCount: 0
  }));
};

export const Group = mongoose.model('Group', groupSchema);
