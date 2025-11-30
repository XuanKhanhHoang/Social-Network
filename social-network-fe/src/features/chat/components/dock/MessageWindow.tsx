'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import { Image as ImageIcon, Minus, Send, Smile, X } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';
import { UserAvatar } from '@/components/ui/user-avatar';

interface MessageWindowProps {
  sessionId: string;
  user: UserSummaryDto;
  isMinimized?: boolean;
}

export const MessageWindow = ({
  sessionId,
  user,
  isMinimized,
}: MessageWindowProps) => {
  const { closeSession, minimizeSession } = useChatContext();

  if (isMinimized) {
    return (
      <div
        className="w-[328px] bg-white rounded-t-lg shadow-md border border-gray-200 flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => minimizeSession(sessionId)}
      >
        <div className="flex items-center">
          <UserAvatar
            src={user.avatar?.url}
            name={user.firstName}
            className="h-8 w-8 mr-2"
            size={32}
          />
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              closeSession(sessionId);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[328px] h-[455px] bg-white rounded-t-lg shadow-2xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center cursor-pointer hover:opacity-80">
          <div className="relative">
            <UserAvatar
              src={user.avatar?.url}
              name={user.firstName}
              className="h-8 w-8 mr-2"
              size={32}
            />
            {/* Online Status Indicator (Mock) */}
            <div className="absolute bottom-0 right-2 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] leading-4">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[11px] text-gray-500">Đang hoạt động</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-blue-500 hover:bg-blue-50"
            onClick={() => minimizeSession(sessionId)}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => closeSession(sessionId)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Message Area (Placeholder) */}
      <div className="flex-1 overflow-y-auto p-3 bg-white space-y-4">
        {/* Timestamp */}
        <div className="text-center">
          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            HÔM NAY 10:23
          </span>
        </div>

        {/* Received Message */}
        <div className="flex items-end gap-2">
          <UserAvatar
            src={user.avatar?.url}
            name={user.firstName}
            className="h-7 w-7 mb-1"
            size={28}
          />
          <div className="bg-gray-100 rounded-2xl rounded-bl-none px-3 py-2 max-w-[75%]">
            <p className="text-[15px] text-gray-900">
              Chào cậu, hôm nay đi cafe không? 👋
            </p>
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex items-end gap-2 justify-end">
          <div className="bg-gray-900 text-white rounded-2xl rounded-br-none px-3 py-2 max-w-[75%]">
            <p className="text-[15px]">Nghe hợp lý đấy! Mấy giờ thế?</p>
          </div>
        </div>

        {/* Received Message */}
        <div className="flex items-end gap-2">
          <UserAvatar
            src={user.avatar?.url}
            name={user.firstName}
            className="h-7 w-7 mb-1"
            size={28}
          />
          <div className="bg-gray-100 rounded-2xl rounded-bl-none px-3 py-2 max-w-[75%]">
            <p className="text-[15px] text-gray-900">
              Tầm 2h chiều nhé, ở quán cũ.
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:bg-blue-50 flex-shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Nhập tin nhắn..."
              className="pr-8 h-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full text-[15px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-8 text-gray-400 hover:text-gray-600"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 bg-blue-500 hover:bg-blue-600 rounded-full flex-shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
