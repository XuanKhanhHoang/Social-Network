'use client';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { usePostModalContext } from '@/features/post/contexts/PostModalContext';

export default function PostCreator() {
  const user = useStore((state) => state.user);
  const { openCreate } = usePostModalContext();

  return (
    <div className="bg-white rounded-sm shadow-xs p-4 mb-5 border border-gray-100">
      <div className="flex items-center space-x-3">
        <UserAvatar
          name={user!.firstName}
          src={user!.avatar?.url}
          className="w-10 h-10"
          size={128}
        />
        <Button
          onClick={openCreate}
          variant="secondary"
          className="flex-1 h-10 bg-white hover:bg-gray-100 rounded-full px-4 text-left text-gray-500 transition-colors justify-start font-normal"
        >
          Hỡi cư dân của Vibe, bạn đang nghĩ gì thế?
        </Button>
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={openCreate}
          className="text-[13px] text-gray-400   cursor-pointer"
        >
          Bạn đang nghĩ gì thế?
        </button>
        <button
          onClick={openCreate}
          className="text-[13px] text-gray-400   cursor-pointer"
        >
          Chia sẻ khoảnh khắc của bạn nào!
        </button>
        <button
          onClick={openCreate}
          className="text-[13px] text-gray-400   cursor-pointer"
        >
          Hôm nay bạn ở đâu?
        </button>
        <button
          onClick={openCreate}
          className="text-[13px] text-gray-400   cursor-pointer"
        >
          Mọi người đang chờ bạn đó!
        </button>
      </div>
    </div>
  );
}
