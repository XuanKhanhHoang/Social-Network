'use client';

import { Button } from '@/components/ui/button';
import { UserSummaryDto } from '@/features/user/services/user.dto';
import { Minus, X } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ChatInputArea } from './ChatInputArea';
import { useChatMessages } from '../../hooks/useChatMessages';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';

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
  const { messages, sendMessage } = useChatMessages(sessionId);

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
    <div className="w-[328px] h-[500px] bg-white rounded-t-lg shadow-2xl flex flex-col border border-gray-200 font-sans">
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
            className="h-7 w-7 text-gray-400 hover:bg-gray-100"
            onClick={() => minimizeSession(sessionId)}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400  hover:bg-gray-100"
            onClick={() => closeSession(sessionId)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        {messages.length > 0 && (
          <div className="text-center mb-4">
            <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-sm uppercase tracking-wide">
              Hôm nay 10:23
            </span>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          const contentHtml = msg.content
            ? generateHTML(msg.content, [StarterKit, Emoji])
            : '';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}
            >
              {!isMe && (
                <UserAvatar
                  src={user.avatar?.url}
                  name={user.firstName}
                  className="h-8 w-8 mb-1 flex-shrink-0"
                  size={32}
                />
              )}
              <div
                className={`flex flex-col gap-1 max-w-[75%] ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                {msg.media && (
                  <div className="mb-1">
                    <img
                      src={msg.media.url}
                      alt="Media"
                      className={`rounded-xl max-h-[200px] w-auto object-cover border border-gray-100 ${
                        msg.status === 'sending' ? 'opacity-70' : ''
                      }`}
                    />
                  </div>
                )}

                {contentHtml && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-gray-900 text-white rounded-br-none'
                        : 'bg-gray-50 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <div
                      className={`prose max-w-none ${
                        isMe ? 'prose-invert' : ''
                      } [&_p]:m-0 [&_p]:leading-relaxed`}
                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                  </div>
                )}

                {msg.status === 'sending' && (
                  <span className="text-[10px] text-gray-400 px-1">
                    Đang gửi...
                  </span>
                )}
                {msg.status === 'error' && (
                  <span className="text-[10px] text-red-500 px-1">Lỗi gửi</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ChatInputArea onSend={sendMessage} />
    </div>
  );
};
