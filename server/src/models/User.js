import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => uuidv4() 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    minlength: 3, 
    maxlength: 30, 
    match: /^[a-zA-Z0-9_]+$/ 
  },
  passwordHash: { 
    type: String, 
    required: true,
    select: false // Excluded by default for security
  },
  passwordVersion: { 
    type: Number, 
    default: 1 
  },
  email: { 
    type: String, 
    select: false,
    lowercase: true,
    trim: true,
    sparse: true,
    unique: true
  },
  vaultKey: { 
    type: String,
    select: false
  },
  vaultKeyIv: { 
    type: String,
    select: false
  },
  vaultKeySalt: { 
    type: String,
    select: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLoginAt: {
    type: Date
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  }
}, { timestamps: true });

// Indexes
//userSchema.index({ username: 1 }, { unique: true });
//userSchema.index({ uuid: 1 }, { unique: true });

// Virtuals
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now() && this.loginAttempts >= 10);
});

// Hooks
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 10 && !this.isLocked) {
    // Lock for 2 hours
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.passwordVersion;
  delete obj.__v;
  delete obj._id;
  return obj;
};

export const User = mongoose.model('User', userSchema);