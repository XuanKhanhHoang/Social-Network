// Email validation
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || typeof email !== 'string')
    return { isValid: false, error: 'Email không được để trống' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? undefined : 'Email không đúng định dạng',
  };
}

// Phone number validation (VN format)
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Password validation
export function validatePassword(
  password: string,
  length = 6
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < length)
    errors.push(`Mật khẩu phải có ít nhất ${length} ký tự`);
  if (!/[A-Z]/.test(password)) errors.push('Mật khẩu phải có chữ hoa');
  if (!/[a-z]/.test(password)) errors.push('Mật khẩu phải có chữ thường');
  if (!/[0-9]/.test(password)) errors.push('Mật khẩu phải có chữ số');

  return { isValid: errors.length === 0, errors };
}
