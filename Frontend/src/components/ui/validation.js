export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /\S+@\S+\.\S+/.test(value);
}

export function isYear(value, { min = 1900, max = new Date().getFullYear() + 1 } = {}) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

export function minLength(value, len) {
  return isNonEmptyString(value) && value.trim().length >= len;
}

export function maxLength(value, len) {
  return isNonEmptyString(value) && value.trim().length <= len;
}

export function inRange(n, { min, max }) {
  const num = Number(n);
  return !Number.isNaN(num) && num >= min && num <= max;
}


