'use client';

import { useChatContext } from '../../context/ChatContext';
import { MessageWindow } from './MessageWindow';
import { SearchContactBox } from './SearchContactBox';

export const ChatDock = () => {
  const { sessions } = useChatContext();

  if (sessions.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 flex items-end gap-3 z-50 pointer-events-none">
      {sessions.map((session) => (
        <div key={session.id} className="pointer-events-auto">
          {session.type === 'search' ? (
            <SearchContactBox />
          ) : (
            session.data && (
              <MessageWindow
                sessionId={session.id}
                user={session.data}
                isMinimized={session.isMinimized}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
};
