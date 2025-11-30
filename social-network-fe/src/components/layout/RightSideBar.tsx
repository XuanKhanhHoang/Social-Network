'use client';

import { Button } from '@/components/ui/button';
import { SuggestedMessagingList } from '@/features/chat/components/SuggestedMessagingList';
import { SuggestedFriendSidebar } from '@/features/friendship/components/lists/SuggestedFriendSidebar';
import { Search } from 'lucide-react';

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

      <SuggestedFriendSidebar />
    </aside>
  );
};

export default RightSidebar;
