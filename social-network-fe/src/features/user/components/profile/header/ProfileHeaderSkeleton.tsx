import { Skeleton } from '@/components/ui/skeleton';

export function ProfileHeaderSkeleton() {
  return (
    <header className="bg-card border-b border-border">
      <Skeleton className="h-[350px] w-full rounded-b-lg" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-end -translate-y-[50px]">
          <Skeleton className="w-40 h-40 rounded-full border-4 border-background" />
          <div className="flex-grow ml-5 pb-4">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex gap-2 pb-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </header>
  );
}
