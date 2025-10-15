import { MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PostItemSkeleton({ count = 1 }: { count?: number }) {
  const arr = Array.from({ length: count });
  return (
    <>
      {arr.map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-sm shadow-sm p-0 mb-4 border border-gray-100 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3 p-3">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 me-2"></div>

              <div className="flex flex-col space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-100 h-8 w-8"
              disabled
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-3 pb-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          <div className="py-1"></div>

          <div className="w-full h-64 bg-gray-200"></div>

          <div className="flex items-center space-x-6 text-gray-300 mt-0 py-1 border-t border-b border-gray-100 px-3">
            <div className="flex items-center space-x-2 px-2 py-1">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="py-3 px-3">
            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export default PostItemSkeleton;
