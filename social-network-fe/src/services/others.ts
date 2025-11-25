import { ProvinceDto } from '@/lib/dtos';

const url = 'https://provinces.open-api.vn/api/v2/';

export const otherService = {
  async getProvinces(): Promise<ProvinceDto[]> {
    return fetch(url).then((res) => res.json());
  },
};
