export const sanitizeString = (str, maxLength = 255) => {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
};

export const sanitizeUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : null;
};

export const sanitizeBase64 = (str) => {
  const b64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return b64Regex.test(str) ? str : null;
};

export const sanitizePagination = (page, limit, maxLimit = 100) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(maxLimit, Math.max(1, parseInt(limit) || 50));
  return { page: p, limit: l };
};