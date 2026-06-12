import { Globe, CreditCard, FileText, Database, Shield, Key, IdCard, User, Box, GraduationCap } from 'lucide-react';
import { createTemplateField } from './templateFields';

const buildSystemTemplate = ({ id, name, desc, icon, fields }) => ({
  uuid: id,
  id,
  name,
  desc,
  icon,
  isSystem: true,
  fields: fields.map((field, index) => createTemplateField(field, index + 1))
});

export const SYSTEM_TEMPLATES = [
  buildSystemTemplate({
    id: 'login',
    name: 'Login Credential',
    desc: 'Website or app passwords',
    icon: Globe,
    fields: [
      { label: 'Website URL', fieldType: 'url', isRequired: false, isSensitive: false },
      { label: 'Username / Email', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Password', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'credit_card',
    name: 'Credit Card',
    desc: 'Credit card details & CVV',
    icon: CreditCard,
    fields: [
      { label: 'Card Holder', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Card Number', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Expiry Date', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'CVV', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Bank Name', fieldType: 'text', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'secure_note',
    name: 'Secure Note',
    desc: 'Encrypted free-form text',
    icon: FileText,
    fields: [
      { label: 'Secure Content', fieldType: 'textarea', isRequired: true, isSensitive: true }
    ]
  }),
  buildSystemTemplate({
    id: 'education',
    name: 'Education Portal',
    desc: 'School, College, or University login',
    icon: GraduationCap,
    fields: [
      { label: 'Institution Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Student ID / Roll No', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Portal URL', fieldType: 'url', isRequired: false, isSensitive: false },
      { label: 'Password', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'debit_card',
    name: 'Debit Card',
    desc: 'Debit card details',
    icon: CreditCard,
    fields: [
      { label: 'Card Holder', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Card Number', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Expiry Date', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'CVV', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'bank_account',
    name: 'Bank Account',
    desc: 'Account numbers & IFSC',
    icon: Database,
    fields: [
      { label: 'Account Holder', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Bank Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Account Number', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'IFSC', fieldType: 'text', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'aadhaar',
    name: 'Aadhaar Card',
    desc: 'Aadhaar identity details',
    icon: Shield,
    fields: [
      { label: 'Aadhaar Number', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Date of Birth', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Address', fieldType: 'textarea', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'passport',
    name: 'Passport',
    desc: 'Passport details',
    icon: IdCard,
    fields: [
      { label: 'Passport Number', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Country', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Issue Date', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Expiry Date', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'personal_info',
    name: 'Personal Information',
    desc: 'Basic identity details',
    icon: User,
    fields: [
      { label: 'Full Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'Date of Birth', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Phone Number', fieldType: 'phone', isRequired: false, isSensitive: false },
      { label: 'Email', fieldType: 'email', isRequired: false, isSensitive: false },
      { label: 'Address', fieldType: 'textarea', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'api_keys',
    name: 'API Keys',
    desc: 'Developer API and Secret keys',
    icon: Key,
    fields: [
      { label: 'Service Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'API Key', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Secret Key', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  }),
  buildSystemTemplate({
    id: 'software_license',
    name: 'Software License',
    desc: 'Product keys',
    icon: Box,
    fields: [
      { label: 'Product Name', fieldType: 'text', isRequired: true, isSensitive: false },
      { label: 'License Key', fieldType: 'password', isRequired: true, isSensitive: true },
      { label: 'Purchase Date', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Expiry Date', fieldType: 'date', isRequired: false, isSensitive: false },
      { label: 'Notes', fieldType: 'textarea', isRequired: false, isSensitive: false }
    ]
  })
];
