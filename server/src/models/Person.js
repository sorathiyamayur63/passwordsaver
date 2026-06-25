import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const personSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, default: () => uuidv4() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupUuid: { type: String, required: true },
  fullName: { type: String, required: true, maxlength: 100 },
  nickname: { type: String, maxlength: 50, default: '' },
  avatar: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  vaultItemCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

personSchema.index({ userId: 1, groupUuid: 1 });
personSchema.index({ userId: 1, isFavorite: 1 });

export const Person = mongoose.model('Person', personSchema);
