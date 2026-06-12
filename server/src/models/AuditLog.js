import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  userUuid: { 
    type: String 
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN_SUCCESS', 'LOGIN_FAIL', 'LOGOUT', 'REGISTER', 
      'PASSWORD_CHANGE', 'VAULT_CREATE', 'VAULT_UPDATE', 
      'VAULT_DELETE', 'VAULT_VIEW', 'VAULT_EXPORT', 
      'SESSION_REVOKE', 'DEVICE_REVOKE', 'ACCOUNT_DELETE', 
      'BACKUP_EXPORT', 'BACKUP_IMPORT', 'TEMPLATE_CREATE', 
      'TEMPLATE_DELETE', 'CATEGORY_CREATE', 'CATEGORY_DELETE'
    ]
  },
  resourceType: { 
    type: String 
  },
  ipAddress: {
  type: String
  },
  resourceUuid: { 
    type: String 
  },
  ipHash: { 
    type: String // MUST BE HASHED
  },
  userAgent: { 
    type: String 
  },
  requestId: { 
    type: String 
  },
  success: { 
    type: Boolean, 
    default: true 
  },
  details: { 
    type: mongoose.Schema.Types.Mixed // Safe context metadata. NEVER STORE VAULT DATA HERE.
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

// TTL Index: Auto purge logs after 90 days (7,776,000 seconds)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);