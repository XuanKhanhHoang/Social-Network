import { transformProvince } from '@/lib/interfaces';
import { otherService } from '@/services/others';
import { useQuery } from '@tanstack/react-query';

export const useGetProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: () => otherService.getProvinces(),
    select: (data) => data.map((province) => transformProvince(province)),
  });
};
