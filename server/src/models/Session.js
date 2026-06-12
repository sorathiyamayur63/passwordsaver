import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const sessionSchema = new mongoose.Schema({
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
  deviceUuid: { 
    type: String 
  },
  refreshTokenHash: { 
    type: String, 
    required: true 
  },
  isValid: { 
    type: Boolean, 
    default: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUsedAt: { 
    type: Date, 
    default: Date.now 
  },
  ipHash: { 
    type: String 
  },
  userAgent: { 
    type: String 
  }
});

// Optimization for lookups
sessionSchema.index({ userId: 1, isValid: 1 });

// TTL index to automatically purge expired sessions natively via MongoDB
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model('Session', sessionSchema);