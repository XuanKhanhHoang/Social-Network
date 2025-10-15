'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import StoryCreator from './StoryCreator';

interface Story {
  id: number;
  name: string;
  avatarUrl: string;
}

const STORIES_DATA: Story[] = [
  { id: 1, name: 'Emma', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'David', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Lisa', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Chris', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
];

const StoryItem = ({ story }: { story: Story }) => {
  const isWatched = story.id > 3;

  return (
    <div className="flex flex-col items-center space-y-2 w-16 cursor-pointer flex-shrink-0 group">
      <div
        className={`p-0.5 rounded-full 
          ${
            isWatched
              ? 'bg-gray-200'
              : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
          } 
          group-hover:opacity-85 transition-opacity duration-200
        `}
      >
        <Avatar className="w-16 h-16 border-2 border-white">
          <AvatarImage src={story.avatarUrl} alt={story.name} />
          <AvatarFallback className="bg-gray-100 text-gray-500 text-base">
            {story.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs text-gray-700 font-medium truncate w-full text-center">
        {story.name}
      </span>
    </div>
  );
};

const YourStoryItem = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className="flex flex-col items-center space-y-2 w-16 cursor-pointer flex-shrink-0 group"
      onClick={onClick}
    >
      <div className="p-0.5 rounded-full bg-gray-200 group-hover:opacity-85 transition-opacity duration-200">
        <Avatar className="w-16 h-16 border-2 border-white bg-gray-100">
          <div className="flex items-center justify-center w-full h-full relative">
            <AvatarImage src="" alt="Your Story" />
            <AvatarFallback className="bg-gray-200 text-gray-500 text-base">
              YS
            </AvatarFallback>
            <div className="absolute bottom-0 right-0 p-0.5 rounded-full bg-white border border-gray-200">
              <Plus className="w-5 h-5 text-indigo-500 bg-white rounded-full" />
            </div>
          </div>
        </Avatar>
      </div>

      <span className="text-xs text-gray-700 font-semibold truncate w-full text-center">
        Tin của bạn
      </span>
    </div>
  );
};

const StoriesContainer = () => {
  const [showCreator, setShowCreator] = useState(false);
  return (
    <>
      <div className="py-5 border-b border-gray-200 bg-white mb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 px-5">
            <YourStoryItem onClick={() => setShowCreator(true)} />

            {STORIES_DATA.map((story) => (
              <StoryItem key={story.id} story={story} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>
      {showCreator && (
        <StoryCreator
          isOpen={showCreator}
          onClose={() => setShowCreator(false)}
        />
      )}
    </>
  );
};

export default StoriesContainer;
