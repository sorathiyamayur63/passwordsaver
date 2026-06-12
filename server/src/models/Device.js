import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const deviceSchema = new mongoose.Schema({
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
  deviceFingerprint: { 
    type: String, 
    required: true 
  },
  deviceName: { 
    type: String 
  },
  browser: { 
    type: String 
  },
  os: { 
    type: String 
  },
  ip: { 
    type: String // MUST BE SHA-256 HASHED AT CONTROLLER LEVEL, NEVER PLAINTEXT
  },
  ipHash: {
  type: String
  },
  isTrusted: { 
    type: Boolean, 
    default: false 
  },
  isCurrent: { 
    type: Boolean, 
    default: false 
  },
  isRevoked: { 
    type: Boolean, 
    default: false 
  },
  lastActiveAt: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  revokedAt: { 
    type: Date 
  }
});

deviceSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });

export const Device = mongoose.model('Device', deviceSchema);