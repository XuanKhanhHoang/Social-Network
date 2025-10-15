export function truncateText(
  text: string,
  length: number = 12,
  suffix: string = '...'
): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + suffix;
}
export function truncateFileName(
  fileName: string,
  length: number = 12,
  keepExtension: boolean = true
): string {
  if (!keepExtension) {
    return truncateText(fileName, length);
  }

  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return truncateText(fileName, length);
  }

  const namePart = fileName.slice(0, lastDot);
  const extension = fileName.slice(lastDot);

  const maxNameLength = Math.max(length - extension.length, 1);
  const truncatedName = truncateText(namePart, maxNameLength);

  return truncatedName + extension;
}
export function formatDateString(isoString: string): string {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
