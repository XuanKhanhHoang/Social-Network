'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

type StatusFilter = 'active' | 'deleted' | 'all';

interface PostFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  onSearch: (searchId: string) => void;
  initialSearchValue?: string;
}

export function PostFilters({
  statusFilter,
  onStatusChange,
  onSearch,
  initialSearchValue = '',
}: PostFiltersProps) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value.trim());
    }, 500),
    [onSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Trạng thái:</span>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="deleted">Đã xóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-md relative">
        <Search className="h-4 w-4 absolute left-3 text-gray-400" />
        <Input
          placeholder="Tìm theo ID bài viết..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 pl-9 pr-9"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
