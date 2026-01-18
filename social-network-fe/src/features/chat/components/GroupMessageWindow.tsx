'use client';

import { Button } from '@/components/ui/button';
import { Minus, Settings, X } from 'lucide-react';
import { useChatContext, GroupData } from '@/features/chat/context/ChatContext';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ChatInputArea } from './dock/ChatInputArea';
import { useGroupChatMessages } from '@/features/chat/hooks/useGroupChatMessages';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { useEffect, useState, useMemo, useRef } from 'react';
import { decryptGroupText } from '@/features/crypto/utils/cryptions';
import { ChatMessage } from '@/features/chat/types/chat';
import { useInView } from 'react-intersection-observer';
import { useStore } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { GroupSettingsDialog } from './GroupSettingsDialog';
import { decryptFileEnvelope } from '@/features/crypto/utils/cryptions';

interface GroupMessageWindowProps {
  sessionId: string;
  groupData: GroupData;
  isMinimized?: boolean;
}

const ONE_HOUR = 60 * 60 * 1000;

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const DecryptedGroupMessageContent = ({
  message,
  sharedKey,
  isMe,
}: {
  message: ChatMessage;
  sharedKey: Uint8Array | null;
  isMe: boolean;
}) => {
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);
  const currentUser = useStore((state) => state.user);

  useEffect(() => {
    const decrypt = async () => {
      if (message.isRecovered) return;

      // Group decryption logic
      if (
        !!message.encryptedContents &&
        !!message.nonce &&
        sharedKey &&
        currentUser
      ) {
        // Get encrypted content specific for this user
        const myEncryptedContent = message.encryptedContents[currentUser.id];

        if (myEncryptedContent) {
          try {
            const decryptedJsonStr = decryptGroupText(
              message.nonce,
              message.encryptedContents,
              currentUser.id,
              sharedKey
            );
            if (decryptedJsonStr) {
              const jsonContent = JSON.parse(decryptedJsonStr);
              setDecryptedHtml(generateHTML(jsonContent, [StarterKit, Emoji]));
            } else {
              setDecryptedHtml(
                '<span class="text-red-500 italic">Không thể giải mã</span>'
              );
            }
          } catch (e) {
            console.error('Group decryption failed', e);
            setDecryptedHtml(
              '<span class="text-red-500 italic">Lỗi giải mã</span>'
            );
          }
        } else {
          // Can happen if user was added after message was sent, BUT backend joinedAt filter should prevent serving such messages.
          // Or if message was meant for others.
          setDecryptedHtml(
            '<span class="text-gray-400 italic">Tin nhắn không khả dụng</span>'
          );
        }
      }
    };

    decrypt();
  }, [message, sharedKey, currentUser]);

  if (message.isRecovered) {
    return (
      <div
        className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm pointer-events-none italic text-gray-500 border border-gray-200 ${
          isMe ? 'bg-gray-100 rounded-br-none' : 'bg-gray-50 rounded-bl-none'
        }`}
      >
        Tin nhắn đã thu hồi
      </div>
    );
  }

  if (!decryptedHtml)
    return <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>;

  return (
    <div
      className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm pointer-events-none ${
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

// Wrapper for DecryptedImage to use group logic
const GroupDecryptedImage = ({
  url,
  mediaNonce,
  keyNonce,
  encryptedFileKeys,
  sharedKey,
  alt,
  className,
}: {
  url: string;
  mediaNonce: string;
  keyNonce: string;
  encryptedFileKeys: Record<string, string>;
  sharedKey: Uint8Array;
  alt: string;
  className: string;
}) => {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const currentUser = useStore((state) => state.user);

  useEffect(() => {
    let objectUrl: string | null = null;
    const decrypt = async () => {
      if (!currentUser) return;
      try {
        if (url.startsWith('blob:')) {
          setDecryptedUrl(url);
          return;
        }

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        const decryptedBlob = await decryptFileEnvelope(
          buffer,
          mediaNonce,
          keyNonce,
          encryptedFileKeys,
          currentUser.id,
          sharedKey
        );

        if (decryptedBlob) {
          objectUrl = URL.createObjectURL(decryptedBlob);
          setDecryptedUrl(objectUrl);
        }
      } catch (error) {
        console.error('Error decrypting group image:', error);
      }
    };

    decrypt();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, mediaNonce, keyNonce, encryptedFileKeys, sharedKey, currentUser]);

  if (!decryptedUrl) {
    return <div className={`animate-pulse bg-gray-200 ${className}`} />;
  }

  return <img src={decryptedUrl} alt={alt} className={className} />;
};

export const GroupMessageWindow = ({
  sessionId, // This IS conversationId for groups
  groupData,
  isMinimized,
}: GroupMessageWindowProps) => {
  const { closeSession, minimizeSession } = useChatContext();
  const currentUser = useStore((state) => state.user);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    messages,
    sendMessage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    recallMessage,
    markAsRead,
    memberSharedKeys,
  } = useGroupChatMessages(sessionId);

  const { ref: topSentinelRef, inView: inViewTop } = useInView({
    threshold: 0,
    rootMargin: '100px 0px 0px 0px',
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages]);

  const latestMessage = sortedMessages[0];
  const latestMessageId = latestMessage?.id;

  useEffect(() => {
    if (inViewTop && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewTop, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (latestMessage) {
      if (
        currentUser?.id &&
        latestMessage.sender.id !== currentUser?.id &&
        !latestMessage.readBy.includes(currentUser?.id)
      ) {
        markAsRead(sessionId);
      }
    }
  }, [latestMessage, sessionId, currentUser?.id, markAsRead]);

  useEffect(() => {
    if (latestMessageId) {
      const timeout = setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
        50
      );
      return () => clearTimeout(timeout);
    }
  }, [latestMessageId]);

  const handleRecallMessage = async (messageId: string) => {
    await recallMessage(messageId);
  };

  const toggleMessageTime = (id: string) => {
    setActiveMessageId((prev) => (prev === id ? null : id));
  };

  if (isMinimized) {
    return (
      <div
        className="w-[328px] bg-white rounded-t-lg shadow-md border border-gray-200 flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => minimizeSession(sessionId)}
      >
        <div className="flex items-center">
          <UserAvatar
            src={groupData.avatar}
            name={groupData.name}
            className="h-8 w-8 mr-2"
            size={32}
          />
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {groupData.name}
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
    <>
      <div className="w-[328px] h-[500px] bg-white rounded-t-lg shadow-2xl flex flex-col border border-gray-200 font-sans">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 bg-white rounded-t-lg">
          <div
            className="flex items-center cursor-pointer hover:opacity-80"
            onClick={() => setIsSettingsOpen(true)}
          >
            <div className="relative">
              <UserAvatar
                src={groupData.avatar}
                name={groupData.name}
                className="h-8 w-8 mr-2"
                size={32}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] leading-4 truncate max-w-[150px]">
                {groupData.name}
              </span>
              <span className="text-[11px] text-gray-500">Nhóm</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:bg-gray-100"
              onClick={() => setIsSettingsOpen(true)}
              title="Cài đặt nhóm"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col-reverse gap-2 scroll-smooth">
          {isLoading && sortedMessages.length === 0 ? (
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

              {sortedMessages.map((msg, index) => {
                const isMsgFromMe = msg.sender.id === currentUser?.id;

                // Find shared key to decrypt this message
                // Logic: Decrypt using keyShared(Me, Sender).
                // memberSharedKeys contains { id: MemberId, sharedKey: SharedKey(Me, Member) }
                const senderSharedKey =
                  memberSharedKeys.find((k) => k.id === msg.sender.id)
                    ?.sharedKey || null;

                const nextMsg = sortedMessages[index + 1];
                let showTimeSeparator = false;
                if (nextMsg) {
                  const currentMsgTime = new Date(msg.createdAt).getTime();
                  const nextMsgTime = new Date(nextMsg.createdAt).getTime();
                  if (currentMsgTime - nextMsgTime > ONE_HOUR) {
                    showTimeSeparator = true;
                  }
                } else {
                  showTimeSeparator = true;
                }

                const isTimeVisible =
                  activeMessageId === msg.id ||
                  msg.status === 'sending' ||
                  msg.status === 'error';

                return (
                  <div key={msg.id} className="flex flex-col">
                    {showTimeSeparator && (
                      <div className="flex justify-center my-4">
                        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`group flex items-end gap-2 relative ${
                        isMsgFromMe ? 'justify-end' : ''
                      }`}
                    >
                      {!isMsgFromMe && (
                        <UserAvatar
                          src={msg.sender.avatar?.url}
                          name={msg.sender.firstName}
                          className="h-8 w-8 mb-1 flex-shrink-0"
                          size={32}
                        />
                      )}

                      {isMsgFromMe && !msg.isRecovered && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => handleRecallMessage(msg.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Thu hồi tin nhắn
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      <div
                        className={`flex flex-col gap-1 max-w-[75%] ${
                          isMsgFromMe ? 'items-end' : 'items-start'
                        }`}
                        onClick={() => toggleMessageTime(msg.id)}
                      >
                        {msg.mediaUrl && !msg.isRecovered && (
                          <div className="mb-1">
                            <GroupDecryptedImage
                              url={msg.mediaUrl}
                              mediaNonce={msg.mediaNonce || ''}
                              keyNonce={msg.keyNonce || ''}
                              encryptedFileKeys={msg.encryptedFileKeys || {}}
                              sharedKey={senderSharedKey || new Uint8Array()}
                              alt="Media"
                              className={`rounded-xl max-h-[200px] w-auto object-cover border border-gray-100 ${
                                msg.status === 'sending' ? 'opacity-70' : ''
                              }`}
                            />
                          </div>
                        )}

                        <div className="relative cursor-pointer">
                          {(!!msg.encryptedContents ||
                            !!msg.decryptedContent) && (
                            <DecryptedGroupMessageContent
                              message={msg}
                              sharedKey={senderSharedKey}
                              isMe={isMsgFromMe}
                            />
                          )}
                        </div>

                        {/* User name for other people's messages in group */}
                        {!isMsgFromMe && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            {msg.sender.lastName} {msg.sender.firstName}
                          </span>
                        )}

                        <div
                          className={`flex items-center gap-2 px-1 overflow-hidden transition-all duration-300 ease-in-out ${
                            isTimeVisible
                              ? 'max-h-[20px] opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          {msg.status === 'sending' ? (
                            <span className="text-[10px] text-gray-400">
                              Đang gửi...
                            </span>
                          ) : msg.status === 'error' ? (
                            <span className="text-[10px] text-red-500">
                              Lỗi gửi
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 select-none">
                              {formatDateTime(msg.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isMsgFromMe && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center"></div>
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
          onSend={(content, media) => {
            sendMessage(content, media);
            setTimeout(
              () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
              50
            );
          }}
          disabled={isLoading}
        />
      </div>

      <GroupSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        conversationId={sessionId}
        groupName={groupData.name}
        groupAvatar={groupData.avatar}
      />
    </>
  );
};
