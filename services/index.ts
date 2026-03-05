/**
 * Services Index
 * Main export point for all service layers
 */

// Client Layer - Frontend API calls (grouped export)
import * as clientLayer from './client';
export { clientLayer };

// Server Layer - Business logic (grouped export)
import * as serverLayer from './server';
export { serverLayer };

// Helpers - Utilities
export * from './helpers';

// HTTP Client
export { default as httpClient } from './http';

// For convenience, also export individual modules
export { userClient, getProfile, updateProfile, changePassword } from './client/user.client';
export { mediaClient, uploadImage as uploadImageClient } from './client/media.client';
export { notificationClient, getUnreadNotifications, markAllNotificationsRead } from './client/notification.client';

export { getUserProfile, updateUserProfile, changeUserPassword } from './server/user.service';
export { uploadImage as uploadImageService } from './server/media.service';
