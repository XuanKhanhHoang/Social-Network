export function encodeCursor<T>(cursorData: T): string {
  const jsonString = JSON.stringify(cursorData);
  return Buffer.from(jsonString)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeCursor<T>(cursor: string): T {
  const base64 = cursor.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = Buffer.from(base64, 'base64').toString('ascii');
  return JSON.parse(decoded) as T;
}
