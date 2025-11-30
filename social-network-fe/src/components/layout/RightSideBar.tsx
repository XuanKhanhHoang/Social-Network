'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { SuggestedMessagingList } from '@/features/chat/components/SuggestedMessagingList';

const SUGGESTED_USERS = [
  {
    id: 101,
    name: 'Sarah Connor',
    handle: '@sarahc',
  },
  {
    id: 102,
    name: 'Mike Wilson',
    handle: '@mikewilson',
  },
  {
    id: 103,
    name: 'Anna Stark',
    handle: '@annas',
  },
];

const RightSidebar = () => {
  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 sticky top-0 h-screen flex flex-col p-4 space-y-5  flex-shrink-0 overflow-y-auto">
      <div className="shadow-sm  rounded-md p-3 h-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            💬 Người liên hệ
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {}}
            className="w-8 h-8 text-gray-500 hover:text-indigo-600"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <SuggestedMessagingList />
      </div>

      <div className="shadow-sm rounded-md p-3 h-1/2 flex flex-col overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          👥 Gợi ý bạn bè
        </h3>

        {SUGGESTED_USERS.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Avatar className="w-9 h-9 flex-shrink-0 mr-3">
                <AvatarFallback className="text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.handle}
                </div>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-400 h-7 px-3 text-xs flex items-center"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Kết bạn
            </Button>
          </div>
        ))}

        <div className="mt-auto text-right z-20">
          <a
            href="#"
            className="text-xs text-blue-500 font-semibold transition-colors"
          >
            Xem thêm
          </a>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
