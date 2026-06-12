import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const fieldSchema = new mongoose.Schema({
  uuid: { type: String, default: () => uuidv4() },
  label: { type: String, required: true },
  fieldType: { 
    type: String, 
    enum: ['text', 'password', 'number', 'date', 'email', 'url', 'phone', 'checkbox', 'dropdown', 'textarea'], 
    required: true 
  },
  placeholder: String,
  isRequired: { type: Boolean, default: false },
  isSensitive: { type: Boolean, default: false },
  options: [String],
  order: Number
}, { _id: false });

const templateSchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    unique: true, 
    default: () => uuidv4() 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 
  },
  description: String,
  isSystem: { 
    type: Boolean, 
    default: false 
  },
  fields: [fieldSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

templateSchema.statics.getSystemTemplates = function() {
  return [
    {
      name: 'Login Credential',
      isSystem: true,
      fields: [
        { label: 'Title', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Website', fieldType: 'url', isRequired: false, order: 2 },
        { label: 'Username', fieldType: 'text', isRequired: true, order: 3 },
        { label: 'Password', fieldType: 'password', isRequired: true, isSensitive: true, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Credit Card',
      isSystem: true,
      fields: [
        { label: 'Card Holder', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Card Number', fieldType: 'text', isRequired: true, isSensitive: true, order: 2 },
        { label: 'Expiry Date', fieldType: 'text', placeholder: 'MM/YY', isRequired: true, order: 3 },
        { label: 'CVV', fieldType: 'password', isRequired: true, isSensitive: true, order: 4 },
        { label: 'Bank Name', fieldType: 'text', isRequired: false, order: 5 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 6 }
      ]
    },
    {
      name: 'Debit Card',
      isSystem: true,
      fields: [
        { label: 'Card Holder', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Card Number', fieldType: 'text', isRequired: true, isSensitive: true, order: 2 },
        { label: 'Expiry Date', fieldType: 'text', placeholder: 'MM/YY', isRequired: true, order: 3 },
        { label: 'CVV', fieldType: 'password', isRequired: true, isSensitive: true, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Bank Account',
      isSystem: true,
      fields: [
        { label: 'Account Holder', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Bank Name', fieldType: 'text', isRequired: true, order: 2 },
        { label: 'Account Number', fieldType: 'text', isRequired: true, isSensitive: true, order: 3 },
        { label: 'IFSC', fieldType: 'text', isRequired: false, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Aadhaar',
      isSystem: true,
      fields: [
        { label: 'Aadhaar Number', fieldType: 'text', isRequired: true, isSensitive: true, order: 1 },
        { label: 'Name', fieldType: 'text', isRequired: true, order: 2 },
        { label: 'Date of Birth', fieldType: 'date', isRequired: false, order: 3 },
        { label: 'Address', fieldType: 'textarea', isRequired: false, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Passport',
      isSystem: true,
      fields: [
        { label: 'Passport Number', fieldType: 'text', isRequired: true, isSensitive: true, order: 1 },
        { label: 'Country', fieldType: 'text', isRequired: false, order: 2 },
        { label: 'Issue Date', fieldType: 'date', isRequired: false, order: 3 },
        { label: 'Expiry Date', fieldType: 'date', isRequired: false, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Personal Information',
      isSystem: true,
      fields: [
        { label: 'Full Name', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Date of Birth', fieldType: 'date', isRequired: false, order: 2 },
        { label: 'Phone Number', fieldType: 'phone', isRequired: false, order: 3 },
        { label: 'Email', fieldType: 'email', isRequired: false, order: 4 },
        { label: 'Address', fieldType: 'textarea', isRequired: false, order: 5 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 6 }
      ]
    },
    {
      name: 'API Keys',
      isSystem: true,
      fields: [
        { label: 'Service Name', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'API Key', fieldType: 'text', isRequired: true, isSensitive: true, order: 2 },
        { label: 'Secret Key', fieldType: 'password', isRequired: false, isSensitive: true, order: 3 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 4 }
      ]
    },
    {
      name: 'Software License',
      isSystem: true,
      fields: [
        { label: 'Product Name', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'License Key', fieldType: 'text', isRequired: true, isSensitive: true, order: 2 },
        { label: 'Purchase Date', fieldType: 'date', isRequired: false, order: 3 },
        { label: 'Expiry Date', fieldType: 'date', isRequired: false, order: 4 },
        { label: 'Notes', fieldType: 'textarea', isRequired: false, order: 5 }
      ]
    },
    {
      name: 'Secure Notes',
      isSystem: true,
      fields: [
        { label: 'Title', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Content', fieldType: 'textarea', isRequired: true, isSensitive: true, order: 2 }
      ]
    }
  ].map(template => ({
    uuid: uuidv4(),
    ...template,
    fields: template.fields.map(field => ({ uuid: uuidv4(), ...field }))
  }));
};

export const Template = mongoose.model('Template', templateSchema);