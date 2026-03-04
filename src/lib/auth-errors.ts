import { AuthError } from "@supabase/supabase-js";

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function mapAuthError(error: AuthError): AuthFieldErrors {
  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return { general: "Invalid email or password" };
  }
  if (msg.includes("email not confirmed")) {
    return { general: "Please check your email and confirm your account" };
  }
  if (msg.includes("user already registered")) {
    return { email: "An account with this email already exists" };
  }
  if (msg.includes("invalid email")) {
    return { email: "Please enter a valid email address" };
  }
  if (msg.includes("password") && msg.includes("too short")) {
    return { password: "Password must be at least 6 characters" };
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return { general: "Too many attempts. Please try again later" };
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return { general: "Network error. Please check your connection" };
  }

  return { general: error.message || "Something went wrong. Please try again" };
}
