/**
 * Validation Helper
 * Centralized validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character',
    };
  }

  return { isValid: true };
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must not exceed 20 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  return { isValid: true };
}

/**
 * Validate phone number (optional, basic validation)
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return required ? { isValid: false, error: 'Phone is required' } : { isValid: true };
  }

  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone format' };
  }

  return { isValid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateFields(fields: Record<string, string>, validators: Record<string, (value: string) => ValidationResult>): ValidationResult {
  for (const [field, value] of Object.entries(fields)) {
    const validator = validators[field];
    if (validator) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
  }

  return { isValid: true };
}

