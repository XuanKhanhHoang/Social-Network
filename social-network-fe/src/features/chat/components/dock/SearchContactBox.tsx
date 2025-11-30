'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSuggestedFriends } from '@/features/friendship/hooks/useFriendship';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import { Search, X } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';
import { UserAvatar } from '@/components/ui/user-avatar';

export const SearchContactBox = () => {
  const { closeSession, openSession } = useChatContext();
  const { data } = useSuggestedFriends(10);

  const handleUserClick = (user: UserSummaryDto) => {
    openSession({ type: 'private', data: user });
    closeSession('search_contact');
  };

  const suggestedUsers = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="w-[340px] h-[460px] bg-white border border-gray-200 rounded-t-md shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-start border-b border-gray-100/50">
        <div>
          <h3 className="font-semibold text-[16px] text-gray-900 leading-tight">
            Tìm kiếm người liên hệ
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            Bạn muốn nhắn tin cho ai?
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => closeSession('search_contact')}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200" />
          <Input
            placeholder="Nhập tên người dùng..."
            className="pl-9 h-9 bg-gray-50 border-gray-200 rounded text-[14px] transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 custom-scrollbar">
        {/* Meta AI Item */}
        <button className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-all duration-200 text-left group border border-transparent">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm transition-all">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="currentColor"
              />
            </svg>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="w-2 h-2 text-white"
              >
                <path
                  d="M2.5 6L4.5 8L9.5 3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-[14px] text-gray-900 transition-colors">
                Meta AI
              </span>
            </div>
            <p className="text-[12px] text-gray-500 truncate">
              Trợ lý ảo thông minh
            </p>
          </div>
        </button>

        {/* Suggested Users */}
        {suggestedUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleUserClick(user)}
            className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-all duration-200 text-left group border border-transparent"
          >
            <UserAvatar
              src={user.avatar?.url}
              name={user.firstName}
              className="h-10 w-10 mr-3 border border-gray-100 transition-colors"
              size={40}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[14px] text-gray-900 truncate transition-colors">
                {user.firstName} {user.lastName}
              </div>
              <p className="text-[12px] text-gray-500 truncate">
                @{user.username}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
