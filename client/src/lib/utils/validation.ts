import { ZodError } from "zod";
import { toast } from "@/hooks/use-toast";

/**
 * Format a ZodError into a human-readable format
 */
export function formatZodError(error: ZodError): string {
  return error.errors
    .map((err) => {
      const field = err.path.join(".");
      return `${field}: ${err.message}`;
    })
    .join(", ");
}

/**
 * Display form validation errors in a toast
 */
export function displayFormErrors(error: ZodError): void {
  toast({
    title: "Validation Error",
    description: formatZodError(error),
    variant: "destructive",
  });
}

/**
 * Password strength helper that returns guidance on how to meet requirements
 */
export function getPasswordStrength(password: string): {
  isValid: boolean;
  message: string;
  strength: "weak" | "medium" | "strong";
} {
  const minLength = 8;
  const maxLength = 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  
  const validLength = password.length >= minLength && password.length <= maxLength;
  
  if (!validLength) {
    return {
      isValid: false,
      message: `Password must be between ${minLength} and ${maxLength} characters`,
      strength: "weak",
    };
  }
  
  if (!hasUppercase) {
    return {
      isValid: false,
      message: "Password must contain at least 1 uppercase letter",
      strength: "weak",
    };
  }
  
  if (!hasSpecial) {
    return {
      isValid: false,
      message: "Password must contain at least 1 special character",
      strength: "weak",
    };
  }
  
  if (hasUppercase && hasLowercase && hasSpecial && hasNumber) {
    return {
      isValid: true,
      message: "Strong password",
      strength: "strong",
    };
  }
  
  return {
    isValid: true,
    message: "Acceptable password, but could be stronger",
    strength: "medium",
  };
}
