import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    unique: true, 
    default: () => uuidv4() 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  icon: { 
    type: String, 
    default: 'folder' 
  },
  color: { 
    type: String, 
    default: '#6b7280' 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  itemCount: { 
    type: Number, 
    default: 0 
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

categorySchema.statics.getDefaultsForUser = function(userId) {
  const defaults = [
    { name: 'Personal', icon: 'user', color: '#6366f1' },
    { name: 'Social Media', icon: 'share-2', color: '#ec4899' },
    { name: 'Education', icon: 'graduation-cap', color: '#f59e0b' },
    { name: 'Business', icon: 'briefcase', color: '#3b82f6' },
    { name: 'Finance', icon: 'landmark', color: '#10b981' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#f97316' },
    { name: 'Entertainment', icon: 'film', color: '#8b5cf6' },
    { name: 'Development', icon: 'terminal', color: '#06b6d4' },
    { name: 'Travel', icon: 'plane', color: '#14b8a6' },
    { name: 'Health', icon: 'heart-pulse', color: '#ef4444' },
    { name: 'Government', icon: 'building-2', color: '#64748b' },
    { name: 'Other', icon: 'folder', color: '#6b7280' },
  ];

  return defaults.map((cat, index) => ({
    uuid: uuidv4(),
    userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: true,
    itemCount: 0,
    order: index
  }));
};

export const Category = mongoose.model('Category', categorySchema);