'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { keyStorage } from '@/features/crypto/services/key-storage.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';
import { restoreKeyVault } from '../utils/cryptions';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';

export const CryptoGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useStore((s) => s.user);
  const keyVault = useStore((s) => s.keyVault);
  const mySecretKey = useStore((s) => s.mySecretKey);
  const setSecretKey = useStore((s) => s.setSecretKey);

  const [status, setStatus] = useState<'CHECKING' | 'LOCKED' | 'READY'>(
    'CHECKING'
  );
  const [pin, setPin] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const checkIdentity = async () => {
      if (!user) {
        setStatus('READY');
        return;
      }

      if (mySecretKey) {
        setStatus('READY');
        return;
      }

      try {
        const localKey = await keyStorage.getMySecretKey();
        if (localKey) {
          setSecretKey(localKey);
          setStatus('READY');
        } else {
          setStatus('LOCKED');
        }
      } catch (err) {
        console.error('Lỗi đọc IndexedDB:', err);
        setStatus('LOCKED');
      }
    };

    checkIdentity();
  }, [user, mySecretKey, setSecretKey, keyVault]);

  const handleUnlock = async () => {
    if (!pin || pin.length < 6 || !keyVault || !user) return;

    setIsUnlocking(true);
    try {
      const secretKey = await restoreKeyVault(keyVault, pin);

      if (secretKey) {
        await keyStorage.saveMySecretKey(secretKey);
        setSecretKey(secretKey);
        setStatus('READY');
        toast.success('Mở khóa bảo mật thành công');
      } else {
        toast.error('Mã PIN không đúng, vui lòng thử lại');
        setPin('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi hệ thống khi giải mã');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 6) {
      setTimeout(() => {
        handleUnlock();
      }, 100);
    }
  };

  if (status === 'CHECKING') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Đang kiểm tra khóa bảo mật...</p>
        </div>
      </div>
    );
  }

  if (status === 'LOCKED' && user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <LockKeyhole className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Yêu cầu bảo mật</CardTitle>
            <CardDescription>
              Vui lòng nhập mã PIN (6 số) để giải mã tin nhắn trên thiết bị này.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col items-center space-y-6 pt-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={handlePinChange}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {!keyVault && (
                <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded w-full">
                  ⚠️ Lỗi: Không tìm thấy dữ liệu khóa bảo mật. Hãy thử đăng xuất
                  và đăng nhập lại.
                </p>
              )}

              <Button
                onClick={handleUnlock}
                className="w-full h-11 text-base font-semibold"
                disabled={isUnlocking || pin.length < 6}
              >
                {isUnlocking ? 'Đang giải mã...' : 'Mở khóa'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
