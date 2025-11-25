import { ProvinceDto } from '../dtos';

export interface Province {
  codename: string;
  name: string;
  code: number;
}
export function transformProvince(province: ProvinceDto): Province {
  return {
    codename: province.codename,
    name: province.name,
    code: province.code,
  };
}
