// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Input, PasswordInput, Button } from '../../ui';

// const FormWrapper = ({ children, onSubmit, onCancel, isLoading }) => (
//   <form onSubmit={onSubmit} className="space-y-4">
//     {children}
//     <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
//       {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
//       <Button type="submit" loading={isLoading}>Save Item</Button>
//     </div>
//   </form>
// );

// // 1. Login Form
// export const LoginForm = ({ defaultValues, onSubmit, onCancel, isLoading }) => {
//   const schema = z.object({
//     title: z.string().min(1, 'Title is required'),
//     website: z.string().url('Must be a valid URL').or(z.literal('')),
//     username: z.string(),
//     password: z.string(),
//     notes: z.string()
//   });

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: defaultValues || { title: '', website: '', username: '', password: '', notes: '' }
//   });

//   return (
//     <FormWrapper onSubmit={handleSubmit(onSubmit)} onCancel={onCancel} isLoading={isLoading}>
//       <Input label="Title" error={errors.title?.message} {...register('title')} required />
//       <Input label="Website URL" type="url" error={errors.website?.message} {...register('website')} />
//       <Input label="Username / Email" error={errors.username?.message} {...register('username')} />
//       <PasswordInput label="Password" showCopy error={errors.password?.message} {...register('password')} />
//       <Input label="Notes" error={errors.notes?.message} {...register('notes')} />
//     </FormWrapper>
//   );
// };

// // 2. Credit Card Form
// export const CreditCardForm = ({ defaultValues, onSubmit, onCancel, isLoading }) => {
//   const schema = z.object({
//     title: z.string().min(1, 'Title is required'),
//     cardHolder: z.string().min(1, 'Card holder required'),
//     cardNumber: z.string().min(13, 'Invalid card number'),
//     expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format MM/YY').or(z.literal('')),
//     cvv: z.string(),
//     bankName: z.string(),
//     notes: z.string()
//   });

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: defaultValues || { title: '', cardHolder: '', cardNumber: '', expiryDate: '', cvv: '', bankName: '', notes: '' }
//   });

//   return (
//     <FormWrapper onSubmit={handleSubmit(onSubmit)} onCancel={onCancel} isLoading={isLoading}>
//       <Input label="Card Title" error={errors.title?.message} {...register('title')} required />
//       <Input label="Card Holder Name" error={errors.cardHolder?.message} {...register('cardHolder')} required />
//       <PasswordInput label="Card Number" showCopy error={errors.cardNumber?.message} {...register('cardNumber')} required />
//       <div className="grid grid-cols-2 gap-4">
//         <Input label="Expiry Date (MM/YY)" error={errors.expiryDate?.message} {...register('expiryDate')} />
//         <PasswordInput label="CVV" error={errors.cvv?.message} {...register('cvv')} />
//       </div>
//       <Input label="Bank Name" error={errors.bankName?.message} {...register('bankName')} />
//       <Input label="Notes" {...register('notes')} />
//     </FormWrapper>
//   );
// };

// // 3. Secure Note Form
// export const SecureNoteForm = ({ defaultValues, onSubmit, onCancel, isLoading }) => {
//   const schema = z.object({
//     title: z.string().min(1, 'Title is required'),
//     content: z.string().min(1, 'Note content cannot be empty')
//   });

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: defaultValues || { title: '', content: '' }
//   });

//   return (
//     <FormWrapper onSubmit={handleSubmit(onSubmit)} onCancel={onCancel} isLoading={isLoading}>
//       <Input label="Note Title" error={errors.title?.message} {...register('title')} required />
//       <div className="space-y-1.5">
//         <label className="block text-sm font-medium text-[var(--text-primary)]">Secure Content <span className="text-[var(--danger)]">*</span></label>
//         <textarea 
//           className="w-full h-40 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--border-focus)] outline-none resize-y"
//           {...register('content')}
//         />
//         {errors.content && <p className="text-xs text-[var(--danger)]">{errors.content.message}</p>}
//       </div>
//     </FormWrapper>
//   );
// };

// // Note: Additional forms (Aadhaar, API Keys, etc.) strictly mirror these patterns using react-hook-form + zod schemas. 
// // For brevity in output size, they scale exactly like the above mapping Zod validations to inputs.

import React, { useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, PasswordInput, Button } from '../../ui';
import { normalizeTemplateFields } from '../../../utils/templateFields';
import { CategorySelector } from '../CategorySelector';

const FormWrapper = ({ children, onSubmit, onCancel, isLoading }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {children}
    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
      {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      <Button type="submit" loading={isLoading}>Save Item</Button>
    </div>
  </form>
);

// 1. Login Form
export const LoginForm = ({ defaultValues, onSubmit, onCancel, isLoading, categories }) => {
  const [categoryUuid, setCategoryUuid] = useState(defaultValues?.categoryUuid || '');
  const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    website: z.string().url('Must be a valid URL').or(z.literal('')),
    username: z.string(),
    password: z.string(),
    notes: z.string()
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { title: '', website: '', username: '', password: '', notes: '' }
  });

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, categoryUuid });
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleFormSubmit)} onCancel={onCancel} isLoading={isLoading}>
      <Input label="Title" error={errors.title?.message} {...register('title')} required />
      <Input label="Website URL" type="url" error={errors.website?.message} {...register('website')} />
      <Input label="Username / Email" error={errors.username?.message} {...register('username')} />
      <PasswordInput label="Password" showCopy error={errors.password?.message} {...register('password')} />
      <CategorySelector value={categoryUuid} onChange={setCategoryUuid} categories={categories} />
      <Input label="Notes" error={errors.notes?.message} {...register('notes')} />
    </FormWrapper>
  );
};

// 2. Credit Card Form
export const CreditCardForm = ({ defaultValues, onSubmit, onCancel, isLoading, categories }) => {
  const [categoryUuid, setCategoryUuid] = useState(defaultValues?.categoryUuid || '');
  const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    cardHolder: z.string().min(1, 'Card holder required'),
    cardNumber: z.string().min(13, 'Invalid card number'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format MM/YY').or(z.literal('')),
    cvv: z.string(),
    bankName: z.string(),
    notes: z.string()
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { title: '', cardHolder: '', cardNumber: '', expiryDate: '', cvv: '', bankName: '', notes: '' }
  });

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, categoryUuid });
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleFormSubmit)} onCancel={onCancel} isLoading={isLoading}>
      <Input label="Card Title" error={errors.title?.message} {...register('title')} required />
      <Input label="Card Holder Name" error={errors.cardHolder?.message} {...register('cardHolder')} required />
      <PasswordInput label="Card Number" showCopy error={errors.cardNumber?.message} {...register('cardNumber')} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Expiry Date (MM/YY)" error={errors.expiryDate?.message} {...register('expiryDate')} />
        <PasswordInput label="CVV" error={errors.cvv?.message} {...register('cvv')} />
      </div>
      <Input label="Bank Name" error={errors.bankName?.message} {...register('bankName')} />
      <CategorySelector value={categoryUuid} onChange={setCategoryUuid} categories={categories} />
      <Input label="Notes" {...register('notes')} />
    </FormWrapper>
  );
};

// 3. Secure Note Form
export const SecureNoteForm = ({ defaultValues, onSubmit, onCancel, isLoading, categories }) => {
  const [categoryUuid, setCategoryUuid] = useState(defaultValues?.categoryUuid || '');
  const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Note content cannot be empty')
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { title: '', content: '' }
  });

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, categoryUuid });
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleFormSubmit)} onCancel={onCancel} isLoading={isLoading}>
      <Input label="Note Title" error={errors.title?.message} {...register('title')} required />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--text-primary)]">Secure Content <span className="text-[var(--danger)]">*</span></label>
        <textarea 
          className="w-full h-40 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--border-focus)] outline-none resize-y"
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-[var(--danger)]">{errors.content.message}</p>}
      </div>
      <CategorySelector value={categoryUuid} onChange={setCategoryUuid} categories={categories} />
    </FormWrapper>
  );
};



// // Note: Additional forms (Identity, API Keys, etc.) strictly mirror these patterns using react-hook-form + zod schemas. 
// // For brevity in output size, they scale exactly like the above mapping Zod validations to inputs.
// 4. Custom Template Form (DYNAMIC)
export const CustomTemplateForm = ({ template, defaultValues, onSubmit, onCancel, isLoading, categories }) => {
  const normalizedFields = normalizeTemplateFields(template?.fields || []);

  const buildInitialFormData = () => {
    const nextFormData = { title: defaultValues?.title || '', categoryUuid: defaultValues?.categoryUuid || '' };

    normalizedFields.forEach((field) => {
      const existingValue = defaultValues?.[field.label];
      if (field.fieldType === 'checkbox') {
        nextFormData[field.label] = Boolean(existingValue);
      } else {
        nextFormData[field.label] = existingValue ?? '';
      }
    });

    return nextFormData;
  };

  const [formData, setFormData] = useState(buildInitialFormData);

  useEffect(() => {
    setFormData(buildInitialFormData());
  }, [defaultValues, template?.uuid]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!template) return null;

  return (
    <FormWrapper onSubmit={handleCustomSubmit} onCancel={onCancel} isLoading={isLoading}>
      <Input
        label="Item Title"
        placeholder={`My ${template.name}`}
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      {normalizedFields.map((field) => {
        const fieldLabel = field.label;
        const fieldValue = formData[fieldLabel] ?? '';

        if (field.fieldType === 'checkbox') {
          return (
            <div key={field.uuid} className="flex items-center gap-3 pt-2 pb-1">
              <input
                type="checkbox"
                id={`custom-field-${field.uuid}`}
                required={field.isRequired}
                checked={Boolean(fieldValue)}
                onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor={`custom-field-${field.uuid}`} className="text-sm font-medium text-[var(--text-primary)] cursor-pointer select-none">
                {fieldLabel} {field.isRequired && <span className="text-[var(--danger)]">*</span>}
              </label>
            </div>
          );
        }

        if (field.fieldType === 'dropdown') {
          return (
            <div key={field.uuid} className="space-y-1.5 pt-1">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                {fieldLabel} {field.isRequired && <span className="text-[var(--danger)]">*</span>}
              </label>
              <select
                required={field.isRequired}
                value={fieldValue}
                onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.value })}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--border-focus)] outline-none cursor-pointer"
              >
                <option value="" disabled>Select an option...</option>
                {(field.options || []).map((option, optionIndex) => (
                  <option key={`${field.uuid}-${optionIndex}`} value={option}>{option}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.fieldType === 'textarea') {
          return (
            <div key={field.uuid} className="space-y-1.5 pt-1">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                {fieldLabel} {field.isRequired && <span className="text-[var(--danger)]">*</span>}
              </label>
              <textarea
                required={field.isRequired}
                value={fieldValue}
                onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.value })}
                className="w-full h-32 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--border-focus)] outline-none resize-y"
              />
            </div>
          );
        }

        if (field.fieldType === 'password') {
          return (
            <PasswordInput
              key={field.uuid}
              label={fieldLabel}
              required={field.isRequired}
              value={fieldValue}
              onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.value })}
            />
          );
        }

        return (
          <Input
            key={field.uuid}
            type={field.fieldType}
            label={fieldLabel}
            required={field.isRequired}
            value={fieldValue}
            onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.value })}
          />
        );
      })}
      
      <CategorySelector 
        value={formData.categoryUuid || ''} 
        onChange={(uuid) => setFormData({ ...formData, categoryUuid: uuid })} 
        categories={categories} 
      />
    </FormWrapper>
  );
};