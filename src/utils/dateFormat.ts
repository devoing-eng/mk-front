// src/utils/apiClient.ts

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} y. ago`;
  }
  if (months > 0) {
    return `${months} mon. ago`;
  }
  if (days > 0) {
    return `${days} d. ago`;
  }
  if (hours > 0) {
    return `${hours} h. ago`;
  }
  if (minutes > 0) {
    return `${minutes} min. ago`;
  }
  return 'just now';
}