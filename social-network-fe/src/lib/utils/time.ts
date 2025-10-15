import { formatDateString } from './string';

export function timeAgo(dateStr: string): string {
  const inputDate = new Date(dateStr);
  const now = new Date();

  const diffMs = now.getTime() - inputDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút`;
  }

  if (diffHours < 24) {
    return `${diffHours} giờ`;
  }

  if (diffDays < 30) {
    return `${diffDays} ngày`;
  }

  const diffMonths =
    (now.getFullYear() - inputDate.getFullYear()) * 12 +
    (now.getMonth() - inputDate.getMonth());

  if (diffMonths < 12) {
    return `${diffMonths} tháng`;
  }

  const diffYears = now.getFullYear() - inputDate.getFullYear();
  return `${diffYears} năm`;
}
export const createdLongerThan7days = (time: string) => {
  const createdAt = new Date(time);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 7;
};
export function formatDisplayTime(time: string) {
  return createdLongerThan7days(time) ? formatDateString(time) : timeAgo(time);
}
