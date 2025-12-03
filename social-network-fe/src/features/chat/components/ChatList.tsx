import { useState, useCallback, useEffect } from 'react';
import { useConversationList } from '../hooks/useConversationList';
import { ChatListItem } from './ChatListItem';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { debounce } from 'lodash';
import { useInView } from 'react-intersection-observer';

export const ChatList = ({ onItemClick }: { onItemClick?: () => void }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 800),
    []
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    handleSearchChange(e.target.value);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversationList(debouncedSearch);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const conversations = data || [];

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="pl-8"
            value={search}
            onChange={onInputChange}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              Không tìm thấy cuộc trò chuyện nào
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => (
                <ChatListItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={onItemClick}
                />
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <div ref={ref} className="h-4" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
