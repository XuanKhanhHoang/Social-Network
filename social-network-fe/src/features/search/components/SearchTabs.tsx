'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchTab } from '../types';

export function SearchTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('type') as SearchTab) || 'all';

  const handleTabChange = (tab: SearchTab) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', tab);
    router.push(`/search?${params.toString()}`);
  };

  const tabs: { value: SearchTab; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'people', label: 'Mọi người' },
    { value: 'posts', label: 'Bài viết' },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={currentTab === tab.value ? 'default' : 'outline'}
          onClick={() => handleTabChange(tab.value)}
          className={cn(
            'rounded-md px-6',
            currentTab === tab.value
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
