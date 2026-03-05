import { formatDateByLocale } from "./date";

export const formatTimeAgo = (dateString: string, locale: string = "en"): string => {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffMs = now.getTime() - commentDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // If more than 7 days, show date format
  if (diffDays >= 7) {
    return formatDateByLocale(commentDate, locale);
  }

  // Show relative time for less than 7 days
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  }
  return "just now";
};