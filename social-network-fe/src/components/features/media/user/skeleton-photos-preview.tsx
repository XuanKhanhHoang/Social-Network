import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SkeletonUserPhotos() {
  const skeletonItems = Array.from({ length: 10 });

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skeletonItems.map((_, index) => (
            <div key={index} className="aspect-square relative">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
