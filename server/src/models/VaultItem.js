import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const vaultItemSchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => uuidv4() 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userUuid: { 
    type: String, 
    required: true 
  },
  encryptedData: { 
    type: String, 
    required: true 
  },
  iv: { 
    type: String, 
    required: true 
  },
  authTag: { 
    type: String, 
    required: true 
  },
  itemType: { 
    type: String, 
    required: true, 
    enum: [
      'login', 'credit_card', 'debit_card', 'bank_account', 
      'aadhaar', 'passport', 'personal_info', 'api_key', 
      'software_license', 'secure_note', 'custom'
    ] 
  },
  categoryUuid: { 
    type: String 
  },
  personUuid: {
    type: String,
    default: null
  },
  groupUuid: {
    type: String,
    default: null
  },
  templateUuid: { 
    type: String 
  },
  encryptedTitle: { 
    type: String 
  },
  titleIv: { 
    type: String 
  },
  titleAuthTag: {
    type: String
  },
  isFavorite: { 
    type: Boolean, 
    default: false 
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: {
    type: Date
  },
  tags: {
    type: [String],
    default: []
  },
  lastUsedAt: {
    type: Date
  },
  lastModifiedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Mandatory scoped indexes ensures we can fetch user data securely and efficiently
vaultItemSchema.index({ userId: 1, isDeleted: 1 });
vaultItemSchema.index({ userId: 1, itemType: 1, isDeleted: 1 });
vaultItemSchema.index({ userId: 1, isFavorite: 1, isDeleted: 1 });
vaultItemSchema.index({ userId: 1, lastUsedAt: -1 });
vaultItemSchema.index({ categoryUuid: 1 });
vaultItemSchema.index({ userId: 1, personUuid: 1, isDeleted: 1 });

export const VaultItem = mongoose.model('VaultItem', vaultItemSchema);