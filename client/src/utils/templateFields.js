import { v4 as uuidv4 } from 'uuid';

export const TEMPLATE_FIELD_TYPE_VALUES = ['text', 'password', 'number', 'date', 'email', 'url', 'phone', 'checkbox', 'dropdown', 'textarea'];

const FIELD_TYPE_ALIASES = new Map([
  ['short text', 'text'],
  ['text', 'text'],
  ['website url', 'url'],
  ['website', 'url'],
  ['url', 'url'],
  ['email address', 'email'],
  ['email', 'email'],
  ['phone number', 'phone'],
  ['phone', 'phone'],
  ['number', 'number'],
  ['date', 'date'],
  ['password (masked)', 'password'],
  ['password', 'password'],
  ['long text / notes', 'textarea'],
  ['long text', 'textarea'],
  ['notes', 'textarea'],
  ['textarea', 'textarea'],
  ['checkbox', 'checkbox'],
  ['dropdown', 'dropdown']
]);

const normalizeFieldType = (fieldType) => {
  const raw = String(fieldType || '').trim().toLowerCase();
  if (FIELD_TYPE_ALIASES.has(raw)) return FIELD_TYPE_ALIASES.get(raw);
  if (TEMPLATE_FIELD_TYPE_VALUES.includes(raw)) return raw;
  if (raw.includes('password')) return 'password';
  if (raw.includes('email')) return 'email';
  if (raw.includes('phone') || raw.includes('tel')) return 'phone';
  if (raw.includes('url') || raw.includes('website') || raw.includes('link')) return 'url';
  if (raw.includes('number') || raw === 'int' || raw === 'float') return 'number';
  if (raw.includes('check') || raw.includes('bool') || raw === 'switch') return 'checkbox';
  if (raw.includes('select') || raw.includes('dropdown') || raw.includes('choice')) return 'dropdown';
  if (raw.includes('long') || raw.includes('note') || raw.includes('textarea') || raw.includes('paragraph')) return 'textarea';
  return 'text';
};

const normalizeOptions = (options) => {
  if (Array.isArray(options)) {
    return options
      .map((option) => (typeof option === 'string' ? option.trim() : option))
      .filter(Boolean);
  }

  if (typeof options === 'string') {
    return options.split(',').map((option) => option.trim()).filter(Boolean);
  }

  return [];
};

export const createTemplateField = (field = {}, order = 1) => ({
  uuid: field.uuid || uuidv4(),
  label: field.label || field.name || 'Field',
  fieldType: normalizeFieldType(field.fieldType || field.type || field.inputType),
  isRequired: field.isRequired === true || field.required === true || field.validation?.required === true,
  isSensitive: field.isSensitive === true || field.maskOutput === true || field.isMasked === true,
  options: normalizeOptions(field.options || field.choices || field.values),
  order: Number.isFinite(field.order) ? field.order : order
});

export const normalizeTemplateFields = (fields = []) => {
  if (!Array.isArray(fields)) return [];
  return fields.map((field, index) => createTemplateField(field, index + 1));
};

export const cloneTemplateFields = (fields = []) => normalizeTemplateFields(fields).map((field, index) => ({
  ...field,
  uuid: uuidv4(),
  order: index + 1
}));

export const createBlankTemplateField = (order = 1) => createTemplateField({
  label: 'New Field',
  fieldType: 'text',
  isRequired: false,
  isSensitive: false,
  options: []
}, order);

export const normalizeTemplate = (template) => {
  if (!template) return template;
  return {
    ...template,
    fields: normalizeTemplateFields(template.fields)
  };
};
