import { useState } from "react";
import { useLocale } from "next-intl";
import { forgotPassword } from "@/services/client/auth.client";

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  sendForgotPasswordEmail: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for forgot password functionality
 * Handles API calls and state management for forgot password flow
 */
export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const sendForgotPasswordEmail = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await forgotPassword({ 
        email,
      });
      
      // Backend response có thể có nhiều format khác nhau
      // Chỉ cần có response là đã thành công
      if (!response) {
        throw new Error("Invalid response from server");
      }

      // Success - reset password email sent
      const message = (response as any).message || "Email sent successfully";
      // SECURITY: Do not log sensitive information
      // Success - no logging needed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      // SECURITY: Do not log full error object which may contain sensitive data
      // Error already handled by error state
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    sendForgotPasswordEmail,
    clearError,
  };
};