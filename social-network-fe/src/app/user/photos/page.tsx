'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// Giả lập data (bạn sẽ dùng SWR/TanStack Query ở đây)
const photoList = Array.from({ length: 15 }).map((_, i) => ({
  id: `img${i}`,
  src: `https://picsum.photos/300/300?random=${i + 10}`,
  alt: `Ảnh ${i + 1}`,
}));

export default function PhotoPage() {
  // Bạn có thể fetch data ở đây
  const [photos, setPhotos] = useState(photoList);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả ảnh</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Một lưới ảnh responsive:
          - 2 cột trên di động
          - 4 cột trên tablet
          - 5 cột trên desktop lớn
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square relative">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill // fill sẽ lấp đầy div cha
                className="rounded-md object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
