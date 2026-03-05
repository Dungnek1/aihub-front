export async function sendForgotPasswordRequest(
  email: string
): Promise<{ userId: string }> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
  }

  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to send reset email");
  }

  return data;
}

/**
 * Verify email with OTP code
 * @param userId - User ID from forgot password response
 * @param code - OTP code from email
 * @returns Promise with token for password reset
 */
export async function verifyEmailOTP(
  userId: string,
  code: string
): Promise<{ token: string }> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
    }
    const response = await fetch(
      `${backendUrl}/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, code }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    // Return the token from verification response
    return { token: data.token };
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
}

/**
 * Resend verification email
 * @param userId - User ID to resend verification for
 * @returns Promise<boolean> - true if resend successful
 */
export async function resendVerificationEmail(
  userId: string
): Promise<boolean> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
    }
    const response = await fetch(
      `${backendUrl}/auth/resend-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend verification email");
    }

    return true;
  } catch (error) {
    console.error("Resend verification error:", error);
    throw error;
  }
}
