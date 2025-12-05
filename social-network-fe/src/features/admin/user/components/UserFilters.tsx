'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { UserStatus } from '../services/user.dto';

interface UserFiltersProps {
  search: string;
  statusFilter: UserStatus | 'all' | 'inactive' | 'deleted';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatus | 'all' | 'inactive' | 'deleted') => void;
}

export function UserFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: UserFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 800),
    [onSearchChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSearchChange(value);
  };

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Tìm kiếm theo tên, username, email..."
          className="pl-8"
          value={localSearch}
          onChange={handleSearchChange}
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) =>
          onStatusChange(v as UserStatus | 'all' | 'inactive' | 'deleted')
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Đang hoạt động</SelectItem>
          <SelectItem value="locked">Đã khóa</SelectItem>
          <SelectItem value="inactive">Chưa kích hoạt</SelectItem>
          <SelectItem value="deleted">Đã xóa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
