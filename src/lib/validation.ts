export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return undefined;
}

export function validateLogin(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};
  errors.email = validateEmail(email);
  errors.password = validatePassword(password);
  return errors;
}

export function validateSignup(
  email: string,
  password: string,
  confirmPassword: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  errors.email = validateEmail(email);
  errors.password = validatePassword(password);
  errors.confirmPassword = validateConfirmPassword(password, confirmPassword);
  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}
