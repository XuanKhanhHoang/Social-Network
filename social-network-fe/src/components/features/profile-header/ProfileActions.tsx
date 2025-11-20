import { Button } from '@/components/ui/button';
import { Edit3, Plus, Users, MessageCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

export type ViewAsType =
  | 'OWNER'
  | 'FRIEND'
  | 'PUBLIC_LOGGED_IN'
  | 'PUBLIC_LOGGED_OUT';

interface ProfileActionsProps {
  viewAsType: ViewAsType;
}

export function ProfileActions({ viewAsType }: ProfileActionsProps) {
  if (viewAsType === 'OWNER') {
    return (
      <>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm vào tin
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/settings/profile">
            <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa trang
          </Link>
        </Button>
      </>
    );
  }

  if (viewAsType === 'FRIEND') {
    return (
      <>
        <Button variant="secondary">
          <Users className="mr-2 h-4 w-4" /> Bạn bè
        </Button>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_IN') {
    return (
      <>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Thêm bạn bè
        </Button>
        <Button variant="secondary">
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_OUT') {
    return (
      <Link href="/login" passHref>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Đăng nhập để thêm bạn
        </Button>
      </Link>
    );
  }

  return null;
}
