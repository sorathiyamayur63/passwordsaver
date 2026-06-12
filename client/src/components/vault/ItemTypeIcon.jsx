import React from 'react';
import { 
  Globe, CreditCard, Building, IdCard, BookUser, 
  User, Code, Key, FileText, LayoutTemplate 
} from 'lucide-react';

const iconMap = {
  login: Globe,
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Building,
  aadhaar: IdCard,
  passport: BookUser,
  personal_info: User,
  api_key: Code,
  software_license: Key,
  secure_note: FileText,
  custom: LayoutTemplate
};

export const ItemTypeIcon = ({ type, className }) => {
  const Icon = iconMap[type] || LayoutTemplate;
  return <Icon className={className} />;
};