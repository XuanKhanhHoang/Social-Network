'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import { debounce } from 'lodash';
import { Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useSearchContact } from '../../hooks/useSearchContact';
import { SuggestedMessagingUser } from '../../types/chat';

export const SearchContactBox = () => {
  const { closeSession, openSession } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');

  const { data: searchData, isLoading: isSearching } =
    useSearchContact(searchTerm);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 800),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    debouncedSearch(value);
  };

  const handleUserClick = (user: SuggestedMessagingUser) => {
    const mappedUser: UserSummaryDto = {
      _id: user.id,
      username: user.username,
      firstName: user.name,
      lastName: '',
      avatar: user.avatar
        ? {
            url: user.avatar,
          }
        : undefined,
    };

    openSession({ type: 'private', data: mappedUser });
    closeSession('search_contact');
  };

  const usersToDisplay = searchData?.data || [];

  return (
    <div className="w-[340px] h-[460px] bg-white border border-gray-200 rounded-t-md shadow-xl flex flex-col">
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

      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200" />
          <Input
            placeholder="Nhập tên người dùng..."
            className="pl-9 h-9 bg-gray-50 border-gray-200 rounded text-[14px] transition-all"
            value={displayValue}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 custom-scrollbar">
        {isSearching ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Đang tìm kiếm...
          </div>
        ) : (
          <>
            {usersToDisplay.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Không tìm thấy kết quả
              </div>
            ) : (
              usersToDisplay.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-all duration-200 text-left group border border-transparent"
                >
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="h-10 w-10 mr-3 border border-gray-100 transition-colors"
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px] text-gray-900 truncate transition-colors">
                      {user.name}
                    </div>
                    <p className="text-[12px] text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
