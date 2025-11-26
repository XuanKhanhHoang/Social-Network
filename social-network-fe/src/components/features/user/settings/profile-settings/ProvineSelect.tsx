'use client';

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Province } from '@/lib/interfaces';

interface ProvinceSelectProps {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
  provinces: Province[];
  isLoading?: boolean;
}

export const ProvinceSelect = memo(
  function ProvinceSelect({
    value,
    onChange,
    provinces,
    isLoading,
  }: ProvinceSelectProps) {
    const stringValue = value ? String(value) : '-1';

    return (
      <div className="space-y-2">
        <Label htmlFor="province">Tỉnh/Thành phố</Label>
        <Select
          disabled={isLoading}
          value={stringValue}
          onValueChange={(val) => {
            onChange(val === '-1' ? null : Number(val));
          }}
        >
          <SelectTrigger id="province">
            <SelectValue
              placeholder={isLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1" className="text-muted-foreground italic">
              -- Không chọn --
            </SelectItem>
            {provinces?.map((province) => (
              <SelectItem key={province.code} value={String(province.code)}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.value === next.value &&
      prev.provinces === next.provinces &&
      prev.isLoading === next.isLoading
    );
  }
);
