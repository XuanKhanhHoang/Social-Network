import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PostDialogSkeletonProps {
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  hasMedia?: boolean;
}

const PostDetailSkeleton = ({
  isOpen = true,
  onOpenChange,
  hasMedia = true,
}: PostDialogSkeletonProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          hasMedia ? '!max-w-7xl w-[90vw]' : '!max-w-2xl w-full'
        } h-[90vh] p-0 gap-0 border-0 data-[state=open]:animate-none data-[state=closed]:animate-none`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Loading post...</DialogTitle>
        <div className="flex w-full h-full">
          {hasMedia && (
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}

          <div
            className={`${
              hasMedia ? 'w-96' : 'w-full'
            } bg-white flex flex-col border-l flex-shrink-0 relative`}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </div>

            <div className="border-y">
              <div className="px-4 py-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 pb-2 max-h-80">
              <div className="space-y-4 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t w-full px-3 py-3 absolute bottom-0 bg-white">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailSkeleton;
