/**
 * Support Service Client
 * Client-side API calls for support/contact requests
 */

import { http } from "@/services/http";
import { IApiResponse } from "@/types";

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  source: "HOME" | "LANDING_PAGE";
  interest?: string; // Optional
  services?: string[]; // Optional
}

export interface ContactRequestResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  interest?: string;
  services?: string[];
  createdAt: string;
  status: string;
}

/**
 * Submit a contact request
 * @param data - Contact request data
 * @returns Contact request response
 */
export async function submitContactRequest(
  data: ContactRequest
): Promise<ContactRequestResponse> {
  try {
    const response = await http.post<IApiResponse<ContactRequestResponse> | { data?: unknown }>(
      "/support/contact-requests",
      data
    );

    const payload = (response as { data?: any }).data ?? response;
    const contact = (payload as any).data ?? payload;
    return contact as ContactRequestResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to submit contact request";
    throw new Error(errorMessage);
  }
}

export interface NewsletterSubscriptionRequest {
  email: string;
  source: "HOME" | "LANDING_PAGE";
}

export interface NewsletterSubscriptionResponse {
  id: string;
  email: string;
  source: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * Subscribe to newsletter
 * @param data - Newsletter subscription data
 * @returns Newsletter subscription response
 */
export async function subscribeToNewsletter(
  data: NewsletterSubscriptionRequest
): Promise<NewsletterSubscriptionResponse> {
  try {
    const response = await http.post<IApiResponse<NewsletterSubscriptionResponse> | { data?: unknown }>(
      "/support/newsletter-subscriptions",
      data
    );

    const payload = (response as { data?: any }).data ?? response;
    const subscription = (payload as any).data ?? payload;
    return subscription as NewsletterSubscriptionResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to subscribe to newsletter";
    throw new Error(errorMessage);
  }
}

