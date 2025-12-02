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
import { useEffect, useState, useMemo, useRef } from 'react';
import { decryptText } from '@/features/crypto/utils/cryptions';
import { ChatMessage } from '../../types/chat';
import { useConversationId } from '../../hooks/useConversationId';
import { useInView } from 'react-intersection-observer';
import { chatService } from '../../services/chat.service';
import { useStore } from '@/store';

interface MessageWindowProps {
  sessionId: string;
  user: UserSummaryDto;
  isMinimized?: boolean;
}

const DecryptedMessageContent = ({
  message,
  sharedKey,
  isMe,
}: {
  message: ChatMessage;
  sharedKey: Uint8Array | null;
  isMe: boolean;
}) => {
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);

  useEffect(() => {
    const decrypt = async () => {
      if (message.content) {
        setDecryptedHtml(generateHTML(message.content, [StarterKit, Emoji]));
        return;
      }

      if (message.encryptedContent && message.nonce && sharedKey) {
        try {
          const decryptedJsonStr = decryptText(
            message.nonce,
            message.encryptedContent,
            sharedKey
          );
          if (decryptedJsonStr) {
            const jsonContent = JSON.parse(decryptedJsonStr);
            setDecryptedHtml(generateHTML(jsonContent, [StarterKit, Emoji]));
          } else {
            setDecryptedHtml(
              '<span class="text-red-500 italic">Không thể giải mã tin nhắn</span>'
            );
          }
        } catch (e) {
          console.error('Decryption failed', e);
          setDecryptedHtml(
            '<span class="text-red-500 italic">Lỗi giải mã</span>'
          );
        }
      }
    };

    decrypt();
  }, [message, sharedKey]);

  if (!decryptedHtml)
    return <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>;

  return (
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
        dangerouslySetInnerHTML={{ __html: decryptedHtml }}
      />
    </div>
  );
};

export const MessageWindow = ({
  sessionId,
  user,
  isMinimized,
}: MessageWindowProps) => {
  const { closeSession, minimizeSession } = useChatContext();
  const currentUser = useStore((state) => state.user);

  const { ref: topSentinelRef, inView: inViewTop } = useInView({
    threshold: 0,
    rootMargin: '200px 0px 0px 0px',
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversationId, isLoading: isResolvingId } =
    useConversationId(sessionId);

  const {
    messages,
    sendMessage,
    sharedKey,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(conversationId || '', sessionId);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (inViewTop && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }, [inViewTop, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (sortedMessages.length > 0 && conversationId) {
      const lastMsg = sortedMessages[sortedMessages.length - 1];
      if (lastMsg.sender.id !== currentUser?.id) {
        chatService.markAsRead(conversationId);
      }
    }
  }, [sortedMessages, conversationId, currentUser?.id]);

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
      <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 bg-white rounded-t-lg">
        <div className="flex items-center cursor-pointer hover:opacity-80">
          <div className="relative">
            <UserAvatar
              src={user.avatar?.url}
              name={user.firstName}
              className="h-8 w-8 mr-2"
              size={32}
            />
            <div className="absolute bottom-0 right-2 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] leading-4">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[11px] text-gray-500">
              {isResolvingId
                ? 'Đang kết nối...'
                : isLoading
                ? 'Đang tải tin nhắn...'
                : 'Đang hoạt động'}
            </span>
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
            className="h-7 w-7 text-gray-400 hover:bg-gray-100"
            onClick={() => closeSession(sessionId)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col-reverse gap-2 scroll-smooth">
        {isResolvingId ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div ref={bottomRef} />

            {sortedMessages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 text-sm mt-10 mb-auto">
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </div>
            )}

            {sortedMessages.map((msg) => {
              const isMsgFromMe = msg.sender.id === currentUser?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isMsgFromMe ? 'justify-end' : ''
                  }`}
                >
                  {!isMsgFromMe && (
                    <UserAvatar
                      src={user.avatar?.url}
                      name={user.firstName}
                      className="h-8 w-8 mb-1 flex-shrink-0"
                      size={32}
                    />
                  )}
                  <div
                    className={`flex flex-col gap-1 max-w-[75%] ${
                      isMsgFromMe ? 'items-end' : 'items-start'
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

                    <DecryptedMessageContent
                      message={msg}
                      sharedKey={sharedKey}
                      isMe={isMsgFromMe}
                    />

                    {msg.status === 'sending' && (
                      <span className="text-[10px] text-gray-400 px-1">
                        Đang gửi...
                      </span>
                    )}
                    {msg.status === 'error' && (
                      <span className="text-[10px] text-red-500 px-1">
                        Lỗi gửi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div
              ref={topSentinelRef}
              className="h-4 w-full flex justify-center items-center flex-shrink-0 py-2"
            >
              {isFetchingNextPage && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              )}
            </div>
          </>
        )}
      </div>

      <ChatInputArea
        onSend={(content) => {
          sendMessage(content);
          setTimeout(
            () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
            50
          );
        }}
        disabled={isResolvingId || isLoading}
      />
    </div>
  );
};
