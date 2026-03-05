/**
 * AppSession Type
 * Compatible with NextAuth session structure for backward compatibility
 */

export interface AppSession {
  user: {
    userId: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

