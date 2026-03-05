/**
 * User Service (Server-side)
 * Business logic for user operations
 */

import httpClient from '@/services/http';
import { validateName, validateEmail, validatePhone } from '@/services/helpers';

export interface GetProfileInput {
  accessToken: string;
}

export interface UpdateProfileInput {
  accessToken: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  accessToken: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Get user profile
 */
export async function getUserProfile(input: GetProfileInput) {
  if (!input.accessToken) {
    throw new Error('Access token is required');
  }

  const response = await httpClient.get('/api/v1/auth/profile', {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
    },
  });

  return response.data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(input: UpdateProfileInput) {
  if (!input.accessToken) {
    throw new Error('Access token is required');
  }

  // Validate name
  const nameValidation = validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.error);
  }

  // Validate email if provided
  if (input.email) {
    const emailValidation = validateEmail(input.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }
  }

  // Validate phone if provided
  if (input.phone) {
    const phoneValidation = validatePhone(input.phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error);
    }
  }

  const response = await httpClient.put(
    '/api/v1/auth/profile',
    {
      name: input.name.trim(),
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      avatarUrl: input.avatarUrl?.trim(),
    },
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    }
  );

  return response.data;
}

/**
 * Change user password
 */
export async function changeUserPassword(input: ChangePasswordInput) {
  if (!input.accessToken) {
    throw new Error('Access token is required');
  }

  // Validate passwords
  if (!input.currentPassword || input.currentPassword.length === 0) {
    throw new Error('Current password is required');
  }

  if (!input.newPassword || input.newPassword.length === 0) {
    throw new Error('New password is required');
  }

  if (input.newPassword !== input.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const response = await httpClient.put(
    '/api/v1/auth/change-password',
    {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    }
  );

  return response.data;
}

