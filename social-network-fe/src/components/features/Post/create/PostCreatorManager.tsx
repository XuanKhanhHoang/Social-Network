'use client';
import { Image, Smile, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import PostEditor from '../editor/PostEditor';
import { useCreatePostContext } from '../../feed/FeedContext';

export default (function PostCreator() {
  const { closeCreate, isOpen, openCreate } = useCreatePostContext();

  return (
    <>
      <div className="bg-white rounded-sm shadow-xs p-4 mb-5 border border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-white bg-gray-100 rounded-full flex-shrink-0">
            <div className="flex items-center justify-center w-full h-full relative">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className=" text-sm">YS</AvatarFallback>
            </div>
          </Avatar>

          <Button
            onClick={openCreate}
            variant="secondary"
            className="flex-1 h-10 bg-white hover:bg-gray-100 rounded-full px-4 text-left text-gray-500 transition-colors justify-start font-normal"
          >
            Hỡi cư dân của Vibe, bạn đang nghĩ gì thế?
          </Button>
        </div>

        <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
            onClick={() => console.log('Live Video Clicked')}
          >
            <Video className="w-5 h-5 text-red-500" />
            <span className="font-medium text-sm hidden sm:inline">
              Video trực tiếp
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
            onClick={() => console.log('Photo/Video Clicked')}
          >
            <Image className="w-5 h-5 text-green-500" />
            <span className="font-medium text-sm hidden sm:inline">
              Ảnh/video
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
            onClick={() => console.log('Activity Clicked')}
          >
            <Smile className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-sm hidden sm:inline">
              Cảm xúc/hoạt động
            </span>
          </Button>
        </div>
      </div>
      {isOpen && <PostEditor handleClose={closeCreate} />}
    </>
  );
});
